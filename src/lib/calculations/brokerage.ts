import type { BrokerageSource } from "@/lib/schema";
import type { ProjectionContext, SourceProjection } from "./types";

interface ProjectOptions {
  stressTest?: boolean; // applies worst-case sequence to early months
}

export function projectBrokerage(
  s: BrokerageSource,
  ctx: ProjectionContext,
  opts: ProjectOptions = {},
): SourceProjection {
  const points: SourceProjection["points"] = [];
  const grosses: number[] = [];
  const nets: number[] = [];

  const baseMonthlyReturn = Math.pow(1 + s.expectedAnnualReturnPct, 1 / 12) - 1;
  // Volatility model: deterministic stress sequence — first year worst, second year second-worst, then avg.
  // Worst-12 = -2σ annualized; second worst = -σ; baseline = +μ.
  const sigma = s.annualVolatilityPct;
  const worstAnnual = s.expectedAnnualReturnPct - 2 * sigma;
  const secondWorstAnnual = s.expectedAnnualReturnPct - sigma;

  const monthlyInflation = Math.pow(1 + ctx.inflationPct, 1 / 12) - 1;

  let principal = s.startingPrincipal;
  let costBasis = s.costBasis || s.startingPrincipal;
  const ordinaryRate = ctx.taxesEnabled ? topRate(ctx) : 0;
  const ltcgRate = ctx.taxesEnabled ? 0.15 : 0;
  const stateRate = ctx.taxesEnabled ? ctx.stateRateOverride : 0;

  for (let m = 0; m < ctx.horizonMonths; m++) {
    let returnRate = baseMonthlyReturn;
    if (opts.stressTest) {
      if (m < 12) returnRate = Math.pow(1 + worstAnnual, 1 / 12) - 1;
      else if (m < 24) returnRate = Math.pow(1 + secondWorstAnnual, 1 / 12) - 1;
    }
    principal *= 1 + returnRate;

    let withdrawal = 0;
    if (s.withdrawalMode === "fixed_dollar") {
      withdrawal = s.withdrawalAmount;
    } else if (s.withdrawalMode === "fixed_pct") {
      withdrawal = (s.startingPrincipal * s.withdrawalPctOfStart) / 12;
    } else if (s.withdrawalMode === "inflation_adjusted") {
      withdrawal = s.withdrawalAmount * Math.pow(1 + monthlyInflation, m);
    }
    withdrawal = Math.min(withdrawal, Math.max(0, principal));

    // Tax: taxable uses cost-basis proration to compute capital gains portion.
    let tax = 0;
    if (s.taxTreatment === "taxable" && withdrawal > 0 && principal > 0) {
      const basisPortion = costBasis * (withdrawal / (principal + withdrawal));
      const gainPortion = Math.max(0, withdrawal - basisPortion);
      tax = gainPortion * (ltcgRate + stateRate);
      costBasis = Math.max(0, costBasis - basisPortion);
    } else if (s.taxTreatment === "tax_deferred" && withdrawal > 0) {
      tax = withdrawal * (ordinaryRate + stateRate);
    }
    // tax_free: tax = 0

    principal -= withdrawal;
    const net = Math.max(0, withdrawal - tax);

    points.push({ month: m, gross: withdrawal, net, principal: Math.max(0, principal) });
    grosses.push(withdrawal);
    nets.push(net);
  }

  return {
    id: s.id,
    name: s.name,
    type: s.type,
    points,
    monthlyNetMin: nets.length ? Math.min(...nets) : 0,
    monthlyNetAvg: nets.length ? nets.reduce((a, b) => a + b, 0) / nets.length : 0,
    monthlyNetMax: nets.length ? Math.max(...nets) : 0,
    monthlyGrossAvg: grosses.length ? grosses.reduce((a, b) => a + b, 0) / grosses.length : 0,
    endingPrincipal: Math.max(0, principal),
  };
}

function topRate(ctx: ProjectionContext): number {
  const sample = 150000;
  for (const br of ctx.year.brackets[ctx.filingStatus]) {
    if (sample <= br.upTo) return br.rate;
  }
  return 0.24;
}

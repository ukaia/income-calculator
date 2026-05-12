import type { DividendSource } from "@/lib/schema";
import type { ProjectionContext, SourceProjection } from "./types";

export function projectDividend(s: DividendSource, ctx: ProjectionContext): SourceProjection {
  const points: SourceProjection["points"] = [];
  const grosses: number[] = [];
  const nets: number[] = [];

  let principal = s.principal;
  // Tax: qualified at 15% (a reasonable LTCG estimate), ordinary at marginal.
  const ordinaryRate = ctx.taxesEnabled ? topRate(ctx) : 0;
  const qualifiedRate = ctx.taxesEnabled ? 0.15 : 0;
  const stateRate = ctx.taxesEnabled ? ctx.stateRateOverride : 0;

  const monthlyGrowth = Math.pow(1 + s.growthPct, 1 / 12) - 1;

  for (let m = 0; m < ctx.horizonMonths; m++) {
    const annualPayout = principal * s.annualYieldPct * Math.pow(1 + monthlyGrowth, m);
    let payout = 0;
    if (s.frequency === "monthly") payout = annualPayout / 12;
    else if (s.frequency === "quarterly" && m % 3 === 2) payout = annualPayout / 4;
    else if (s.frequency === "annual" && m % 12 === 11) payout = annualPayout;

    let marginInterest = 0;
    if (s.margin.enabled) {
      marginInterest = (s.margin.balance * s.margin.rate) / 12;
    }

    const grossAfterMargin = payout - marginInterest;
    const tax =
      grossAfterMargin > 0
        ? grossAfterMargin * (s.qualifiedPct * qualifiedRate + (1 - s.qualifiedPct) * ordinaryRate) +
          grossAfterMargin * stateRate
        : 0;
    const net = grossAfterMargin - tax;

    if (s.drip && net > 0) {
      principal += net;
    }

    points.push({ month: m, gross: payout, net, principal });
    grosses.push(payout);
    nets.push(net);
  }

  let meta: SourceProjection["meta"] = {};
  if (s.margin.enabled) {
    const monthlyInterest = (s.margin.balance * s.margin.rate) / 12;
    const annualInterest = s.margin.balance * s.margin.rate;
    const annualPayout = s.principal * s.annualYieldPct;
    const netYieldAfterMargin = s.principal > 0 ? (annualPayout - annualInterest) / s.principal : 0;
    // Margin call triggers when equity / position value < maintenance ratio.
    // position value = principal; equity = principal - balance.
    // equity/value = (P*(1-d) - balance) / (P*(1-d)) >= maint
    // solve for d: 1 - balance/(P*maint_complement... simpler: drop d such that
    // (P*(1-d) - balance)/(P*(1-d)) = maint => 1 - balance/(P*(1-d)) = maint
    // => balance/(P*(1-d)) = 1 - maint => P*(1-d) = balance/(1-maint)
    // => 1-d = balance / (P*(1-maint)) => d = 1 - balance/(P*(1-maint))
    const dropToCall =
      s.principal > 0 && s.margin.maintenanceRatio < 1
        ? Math.max(0, 1 - s.margin.balance / (s.principal * (1 - s.margin.maintenanceRatio)))
        : 0;
    meta = {
      marginMonthlyInterest: monthlyInterest,
      marginAnnualInterest: annualInterest,
      netYieldAfterMargin,
      dropToCallPct: dropToCall,
      liquidationPrice: s.principal * (1 - dropToCall),
    };
  }

  return {
    id: s.id,
    name: s.name,
    type: s.type,
    points,
    monthlyNetMin: Math.min(...nets),
    monthlyNetAvg: nets.reduce((a, b) => a + b, 0) / nets.length,
    monthlyNetMax: Math.max(...nets),
    monthlyGrossAvg: grosses.reduce((a, b) => a + b, 0) / grosses.length,
    endingPrincipal: principal,
    meta,
  };
}

function topRate(ctx: ProjectionContext): number {
  // Reasonable default ordinary rate from filing status top bracket of taxable middle.
  // Use 24% as a sensible middle estimate, or sample from brackets at ~150k.
  const sample = 150000;
  const b = ctx.year.brackets[ctx.filingStatus];
  let prev = 0;
  for (const br of b) {
    if (sample <= br.upTo) return br.rate;
    prev = br.upTo;
  }
  void prev;
  return 0.24;
}

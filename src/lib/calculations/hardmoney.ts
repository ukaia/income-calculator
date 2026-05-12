import type { HardMoneySource } from "@/lib/schema";
import type { ProjectionContext, SourceProjection } from "./types";

export function projectHardMoney(s: HardMoneySource, ctx: ProjectionContext): SourceProjection {
  const points: SourceProjection["points"] = [];
  const grosses: number[] = [];
  const nets: number[] = [];

  const expectedLoss = s.defaultProbPct * (1 - s.recoveryRatePct);
  const monthlyRate = s.annualRate / 12;
  const origination = s.principal * s.originationPct;
  const ordinaryRate = topRate(ctx);
  const stateRate = ctx.stateRateOverride;
  const taxRate = ordinaryRate + stateRate;

  // Amortized monthly payment formula
  const amortPmt =
    s.paymentStructure === "amortized" && monthlyRate > 0
      ? (s.principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -s.termMonths))
      : 0;

  let balance = s.principal;
  let endingPrincipal = 0;
  let cycleStart = 0;

  for (let m = 0; m < ctx.horizonMonths; m++) {
    let gross = 0;
    let principalReceived = 0;

    const monthInCycle = m - cycleStart;
    const inLoan = monthInCycle < s.termMonths && balance > 0;

    if (inLoan) {
      const interest = balance * monthlyRate;
      if (s.paymentStructure === "interest_only") {
        gross = interest;
        if (m - cycleStart === s.returnOfPrincipalMonth) {
          principalReceived = balance;
          balance = 0;
        }
      } else if (s.paymentStructure === "amortized") {
        gross = interest;
        const principalPortion = amortPmt - interest;
        principalReceived = Math.max(0, principalPortion);
        balance = Math.max(0, balance - principalReceived);
      } else if (s.paymentStructure === "balloon") {
        if (monthInCycle === s.termMonths - 1) {
          gross = interest;
          principalReceived = balance;
          balance = 0;
        } else {
          gross = 0;
        }
      }
      if (m === cycleStart) gross += origination; // origination paid at start
    }

    // Apply expected loss to gross interest
    const adjustedGross = gross * (1 - expectedLoss);
    const tax = Math.max(0, adjustedGross) * taxRate;
    const net = adjustedGross - tax;

    if (principalReceived > 0 && s.autoReinvest && balance === 0) {
      balance = principalReceived;
      cycleStart = m + 1;
    } else if (principalReceived > 0 && balance === 0) {
      endingPrincipal += principalReceived;
    }

    points.push({ month: m, gross, net, principal: balance + endingPrincipal });
    grosses.push(gross);
    nets.push(net);
  }

  // If still in loan at horizon end, count remaining balance as principal too.
  const finalPrincipal = balance + endingPrincipal;

  return {
    id: s.id,
    name: s.name,
    type: s.type,
    points,
    monthlyNetMin: Math.min(...nets),
    monthlyNetAvg: nets.reduce((a, b) => a + b, 0) / nets.length,
    monthlyNetMax: Math.max(...nets),
    monthlyGrossAvg: grosses.reduce((a, b) => a + b, 0) / grosses.length,
    endingPrincipal: finalPrincipal,
    meta: { expectedLossPct: expectedLoss, originationFee: origination },
  };
}

function topRate(ctx: ProjectionContext): number {
  const sample = 150000;
  for (const br of ctx.year.brackets[ctx.filingStatus]) {
    if (sample <= br.upTo) return br.rate;
  }
  return 0.24;
}

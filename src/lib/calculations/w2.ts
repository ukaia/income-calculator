import type { W2Source } from "@/lib/schema";
import { payFrequencyToMonthly } from "@/lib/formatters";
import { computeFICA } from "@/lib/tax/federal";
import type { ProjectionContext, SourceProjection } from "./types";

export function projectW2(s: W2Source, ctx: ProjectionContext): SourceProjection {
  const points: SourceProjection["points"] = [];
  const baseMonthly = payFrequencyToMonthly(s.grossPerPeriod, s.frequency);
  let nets: number[] = [];
  let grosses: number[] = [];

  for (let m = 0; m < ctx.horizonMonths; m++) {
    const yearsElapsed = Math.floor(m / 12);
    const monthInYear = (m % 12) + 1;
    // Raise applies once per year starting in raiseMonth
    const raisesApplied =
      yearsElapsed + (monthInYear >= s.raiseMonth ? 0 : -1) + (yearsElapsed > 0 ? 0 : monthInYear >= s.raiseMonth ? 0 : 0);
    const effectiveYears = Math.max(
      0,
      yearsElapsed - (yearsElapsed > 0 && monthInYear < s.raiseMonth ? 1 : 0),
    );
    const grossMonthly = baseMonthly * Math.pow(1 + s.annualRaisePct, effectiveYears);

    const pretax401k = grossMonthly * s.pretax401kPct;
    const hsa = s.hsaMonthly;
    const health = s.healthPremiumMonthly;
    const taxableMonthly = Math.max(0, grossMonthly - pretax401k - hsa - health);
    const annualTaxable = taxableMonthly * 12;

    const fed = ctx.taxesEnabled ? annualTaxable * s.fedRate : 0;
    const state = ctx.taxesEnabled && !s.noStateTax ? annualTaxable * s.stateRate : 0;
    const fica = ctx.taxesEnabled ? computeFICA(grossMonthly * 12, ctx.filingStatus, ctx.year).total : 0;
    const totalAnnualTax = fed + state + fica;
    const netMonthly = Math.max(0, taxableMonthly - totalAnnualTax / 12);

    points.push({ month: m, gross: grossMonthly, net: netMonthly, principal: 0 });
    grosses.push(grossMonthly);
    nets.push(netMonthly);
    void raisesApplied;
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
    endingPrincipal: 0,
  };
}

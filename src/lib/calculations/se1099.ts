import type { SE1099Source } from "@/lib/schema";
import { computeSETax } from "@/lib/tax/federal";
import type { ProjectionContext, SourceProjection } from "./types";

export function projectSE1099(s: SE1099Source, ctx: ProjectionContext): SourceProjection {
  const points: SourceProjection["points"] = [];
  const grosses: number[] = [];
  const nets: number[] = [];

  const annualGross = s.grossMonthly * 12;
  const netEarnings = annualGross * (1 - s.businessExpensePct);
  const seCalc = computeSETax(netEarnings, ctx.year);
  const taxableAfterSEDed = Math.max(0, netEarnings - seCalc.employerHalfDeduction);
  const fed = taxableAfterSEDed * s.fedEffectiveRate;
  const state = s.noStateTax ? 0 : taxableAfterSEDed * s.stateRate;
  const totalAnnualTax = seCalc.seTax + fed + state;
  const netMonthly = (netEarnings - totalAnnualTax) / 12;

  for (let m = 0; m < ctx.horizonMonths; m++) {
    points.push({ month: m, gross: s.grossMonthly, net: netMonthly, principal: 0 });
    grosses.push(s.grossMonthly);
    nets.push(netMonthly);
  }

  const quarterlyEstimate = totalAnnualTax / 4;

  return {
    id: s.id,
    name: s.name,
    type: s.type,
    points,
    monthlyNetMin: netMonthly,
    monthlyNetAvg: netMonthly,
    monthlyNetMax: netMonthly,
    monthlyGrossAvg: s.grossMonthly,
    endingPrincipal: 0,
    meta: {
      annualSETax: seCalc.seTax,
      annualFedTax: fed,
      annualStateTax: state,
      quarterlyEstimate,
    },
  };
}

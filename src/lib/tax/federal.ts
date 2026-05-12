import type { FilingStatus, YearBrackets } from "@/constants/taxBrackets";

export interface FedTaxBreakdown {
  taxableIncome: number;
  bracketDetail: { from: number; to: number; rate: number; tax: number }[];
  totalTax: number;
  effectiveRate: number;
}

export function computeFederalTax(
  annualIncome: number,
  status: FilingStatus,
  year: YearBrackets,
  useStandardDeduction = true,
): FedTaxBreakdown {
  const ded = useStandardDeduction ? year.standardDeduction[status] : 0;
  const taxable = Math.max(0, annualIncome - ded);
  const detail: FedTaxBreakdown["bracketDetail"] = [];
  let prev = 0;
  let total = 0;
  for (const b of year.brackets[status]) {
    if (taxable <= prev) break;
    const top = Math.min(taxable, b.upTo);
    const slice = top - prev;
    const tax = slice * b.rate;
    detail.push({ from: prev, to: top, rate: b.rate, tax });
    total += tax;
    prev = top;
    if (taxable <= b.upTo) break;
  }
  return {
    taxableIncome: taxable,
    bracketDetail: detail,
    totalTax: total,
    effectiveRate: annualIncome > 0 ? total / annualIncome : 0,
  };
}

export function computeFICA(
  annualWages: number,
  status: FilingStatus,
  year: YearBrackets,
): { socialSecurity: number; medicare: number; additionalMedicare: number; total: number } {
  const ssBase = Math.min(annualWages, year.ssWageBase);
  const ss = ssBase * 0.062;
  const med = annualWages * 0.0145;
  const threshold = year.additionalMedicareThreshold[status];
  const addMed = Math.max(0, annualWages - threshold) * 0.009;
  return { socialSecurity: ss, medicare: med, additionalMedicare: addMed, total: ss + med + addMed };
}

// Self-employment tax: 15.3% on 92.35% of net earnings; employer-half is deductible.
export function computeSETax(
  annualNetEarnings: number,
  year: YearBrackets,
): { seTax: number; employerHalfDeduction: number; ss: number; medicare: number } {
  const base = Math.max(0, annualNetEarnings) * 0.9235;
  const ssBase = Math.min(base, year.ssWageBase);
  const ss = ssBase * 0.124;
  const med = base * 0.029;
  const total = ss + med;
  return { seTax: total, employerHalfDeduction: total / 2, ss, medicare: med };
}

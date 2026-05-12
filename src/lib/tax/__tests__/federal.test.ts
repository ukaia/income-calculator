import { describe, expect, it } from "vitest";
import { computeFederalTax, computeFICA, computeSETax } from "../federal";
import { FED_2026 } from "@/constants/taxBrackets";

describe("federal tax", () => {
  it("single filer at 100k, hand-checked", () => {
    const r = computeFederalTax(100000, "single", FED_2026);
    // Taxable = 100000 - 15420 = 84580
    expect(r.taxableIncome).toBeCloseTo(84580, 0);
    // Tax: 10% on 12260 + 12% on (49832-12260) + 22% on (84580-49832)
    // = 1226 + 4508.64 + 7644.56 ≈ 13379.2
    expect(r.totalTax).toBeGreaterThan(13000);
    expect(r.totalTax).toBeLessThan(13800);
  });

  it("FICA caps SS at wage base", () => {
    const r = computeFICA(300000, "single", FED_2026);
    // SS portion = ssWageBase * 0.062
    expect(r.socialSecurity).toBeCloseTo(FED_2026.ssWageBase * 0.062, 2);
    // Additional Medicare on income over 200k
    expect(r.additionalMedicare).toBeCloseTo((300000 - 200000) * 0.009, 2);
  });

  it("SE tax has employer-half deduction equal to half of total", () => {
    const r = computeSETax(80000, FED_2026);
    expect(r.employerHalfDeduction).toBeCloseTo(r.seTax / 2, 2);
  });
});

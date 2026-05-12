import { describe, expect, it } from "vitest";
import { projectHardMoney } from "../hardmoney";
import { buildContext } from "../index";
import { settingsSchema, type HardMoneySource } from "@/lib/schema";

const settings = settingsSchema.parse({ horizonYears: 2, taxYear: 2026, filingStatus: "single", state: "NONE" });
const ctx = buildContext(settings);

const base: HardMoneySource = {
  id: "hm", type: "hardmoney", name: "Loan", enabled: true,
  principal: 50000, annualRate: 0.12, termMonths: 12,
  paymentStructure: "interest_only", returnOfPrincipalMonth: 12,
  defaultProbPct: 0, recoveryRatePct: 0, originationPct: 0.02, autoReinvest: false,
};

describe("Hard money projection", () => {
  it("interest-only pays a flat monthly interest", () => {
    const r = projectHardMoney(base, ctx);
    // 50k * 12% / 12 = 500 interest/month for months 1..11; month 0 also has origination 1000
    expect(r.points[1].gross).toBeCloseTo(500, 1);
    expect(r.points[0].gross).toBeCloseTo(500 + 1000, 1); // origination paid month 0
  });

  it("auto-reinvest keeps principal earning beyond initial term", () => {
    const r = projectHardMoney({ ...base, autoReinvest: true, returnOfPrincipalMonth: 11 }, ctx);
    // Should keep generating interest after month 12
    expect(r.points[14].gross).toBeGreaterThan(0);
  });

  it("default probability reduces net", () => {
    const noDefault = projectHardMoney(base, ctx);
    const withDefault = projectHardMoney({ ...base, defaultProbPct: 0.2, recoveryRatePct: 0.5 }, ctx);
    expect(withDefault.points[5].net).toBeLessThan(noDefault.points[5].net);
  });
});

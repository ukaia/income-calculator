import { describe, expect, it } from "vitest";
import { projectBrokerage } from "../brokerage";
import { buildContext } from "../index";
import { settingsSchema, type BrokerageSource } from "@/lib/schema";

const settings = settingsSchema.parse({ horizonYears: 5, taxYear: 2026, filingStatus: "single", state: "NONE" });
const ctx = buildContext(settings);

const base: BrokerageSource = {
  id: "b", type: "brokerage", name: "Broker", enabled: true,
  startingPrincipal: 1_000_000, expectedAnnualReturnPct: 0.07, annualVolatilityPct: 0.15,
  withdrawalMode: "fixed_dollar", withdrawalAmount: 0, withdrawalPctOfStart: 0.04,
  taxTreatment: "tax_free", costBasis: 0,
};

describe("Brokerage projection", () => {
  it("no withdrawal: principal grows at expected rate", () => {
    const r = projectBrokerage(base, ctx);
    // After 1 year, ~7% growth
    expect(r.points[11].principal).toBeGreaterThan(1.06 * 1_000_000);
    expect(r.points[11].principal).toBeLessThan(1.08 * 1_000_000);
  });

  it("4% annual withdrawal converts to monthly amount", () => {
    const r = projectBrokerage({ ...base, withdrawalMode: "fixed_pct" }, ctx);
    // 4% * 1M / 12 ≈ 3333/month
    expect(r.points[0].gross).toBeCloseTo(3333.33, 1);
  });

  it("stress test depresses early principal vs baseline", () => {
    const baseline = projectBrokerage(base, ctx);
    const stressed = projectBrokerage(base, ctx, { stressTest: true });
    expect(stressed.points[11].principal).toBeLessThan(baseline.points[11].principal);
  });

  it("taxable account: cost basis lowers reported gain", () => {
    const taxable = projectBrokerage({ ...base, withdrawalAmount: 4000, taxTreatment: "taxable", costBasis: 800_000 }, ctx);
    expect(taxable.points[0].net).toBeLessThan(4000);
  });
});

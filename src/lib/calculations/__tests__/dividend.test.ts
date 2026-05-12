import { describe, expect, it } from "vitest";
import { projectDividend } from "../dividend";
import { buildContext } from "../index";
import { settingsSchema, type DividendSource } from "@/lib/schema";

const settings = settingsSchema.parse({ horizonYears: 2, taxYear: 2026, filingStatus: "single", state: "NONE" });
const ctx = buildContext(settings);

const base: DividendSource = {
  id: "d", type: "dividend", name: "Div", enabled: true,
  principal: 100000, annualYieldPct: 0.04, frequency: "monthly",
  qualifiedPct: 1, growthPct: 0, drip: false,
  margin: { enabled: false, balance: 0, rate: 0, maintenanceRatio: 0.25, initialRatio: 0.5 },
};

describe("Dividend projection", () => {
  it("monthly frequency pays out every month", () => {
    const r = projectDividend(base, ctx);
    // 100k * 4% / 12 = 333.33 gross before tax
    expect(r.points[0].gross).toBeCloseTo(333.33, 1);
    expect(r.points[1].gross).toBeCloseTo(333.33, 1);
  });

  it("quarterly frequency only pays in months 2,5,8,11 (0-indexed)", () => {
    const r = projectDividend({ ...base, frequency: "quarterly" }, ctx);
    expect(r.points[0].gross).toBe(0);
    expect(r.points[1].gross).toBe(0);
    expect(r.points[2].gross).toBeGreaterThan(0);
    expect(r.points[5].gross).toBeGreaterThan(0);
  });

  it("DRIP grows principal over time", () => {
    const r = projectDividend({ ...base, drip: true }, ctx);
    expect(r.endingPrincipal).toBeGreaterThan(base.principal);
  });

  it("margin computes drop-to-call correctly", () => {
    const r = projectDividend(
      {
        ...base,
        margin: { enabled: true, balance: 30000, rate: 0.08, maintenanceRatio: 0.25, initialRatio: 0.5 },
      },
      ctx,
    );
    // d = 1 - balance / (P * (1 - maint)) = 1 - 30000 / (100000 * 0.75) = 1 - 0.4 = 0.6
    expect(Number(r.meta!.dropToCallPct)).toBeCloseTo(0.6, 2);
  });
});

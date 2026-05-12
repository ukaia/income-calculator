import { describe, expect, it } from "vitest";
import { projectW2 } from "../w2";
import { buildContext } from "../index";
import { settingsSchema, type W2Source } from "@/lib/schema";

const settings = settingsSchema.parse({ horizonYears: 1, taxYear: 2026, filingStatus: "single" });
const ctx = buildContext(settings);

const baseSource: W2Source = {
  id: "x", type: "w2", name: "Test W2", enabled: true,
  grossPerPeriod: 4000, frequency: "biweekly",
  fedRate: 0.15, stateRate: 0.05, noStateTax: false,
  pretax401kPct: 0, hsaMonthly: 0, healthPremiumMonthly: 0,
  annualRaisePct: 0, raiseMonth: 1,
};

describe("W2 projection", () => {
  it("monthly gross matches frequency conversion", () => {
    const r = projectW2(baseSource, ctx);
    // 4000 biweekly => 4000 * 26 / 12 = 8666.67
    expect(r.points[0].gross).toBeCloseTo(8666.67, 1);
  });

  it("net is reduced by federal+state+FICA", () => {
    const r = projectW2(baseSource, ctx);
    const monthlyGross = 8666.67;
    expect(r.points[0].net).toBeGreaterThan(0);
    expect(r.points[0].net).toBeLessThan(monthlyGross);
  });

  it("pretax 401k reduces net less than the contribution amount (tax savings)", () => {
    const noContrib = projectW2({ ...baseSource, pretax401kPct: 0 }, ctx);
    const withContrib = projectW2({ ...baseSource, pretax401kPct: 0.1 }, ctx);
    const contribDollars = 8666.67 * 0.1;
    // net should fall by less than the full contribution due to tax shielding
    expect(noContrib.points[0].net - withContrib.points[0].net).toBeLessThan(contribDollars);
  });

  it("annual raise compounds in subsequent years", () => {
    const longCtx = buildContext(settingsSchema.parse({ horizonYears: 3, taxYear: 2026, filingStatus: "single" }));
    const r = projectW2({ ...baseSource, annualRaisePct: 0.1, raiseMonth: 1 }, longCtx);
    // After 2 years of 10% raises, gross should be ~21% higher than start.
    const start = r.points[0].gross;
    const after2yr = r.points[24].gross;
    expect(after2yr / start).toBeGreaterThan(1.18);
    expect(after2yr / start).toBeLessThan(1.25);
  });
});

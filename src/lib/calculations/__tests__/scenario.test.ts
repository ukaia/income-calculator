import { describe, expect, it } from "vitest";
import { projectAll, aggregate } from "../index";
import { settingsSchema, type Source } from "@/lib/schema";

const settings = settingsSchema.parse({ horizonYears: 5, taxYear: 2026, filingStatus: "single", state: "NONE" });

const sources: Source[] = [
  {
    id: "w2", type: "w2", name: "Day job", enabled: true,
    grossPerPeriod: 5000, frequency: "biweekly",
    fedRate: 0.18, stateRate: 0, noStateTax: true,
    pretax401kPct: 0.06, hsaMonthly: 0, healthPremiumMonthly: 0,
    annualRaisePct: 0.03, raiseMonth: 1,
  },
  {
    id: "div", type: "dividend", name: "Dividends", enabled: true,
    principal: 200000, annualYieldPct: 0.04, frequency: "quarterly",
    qualifiedPct: 1, growthPct: 0.05, drip: true,
    margin: { enabled: false, balance: 0, rate: 0, maintenanceRatio: 0.25, initialRatio: 0.5 },
  },
  {
    id: "hm", type: "hardmoney", name: "HML", enabled: true,
    principal: 100000, annualRate: 0.1, termMonths: 12,
    paymentStructure: "interest_only", returnOfPrincipalMonth: 12,
    defaultProbPct: 0, recoveryRatePct: 0, originationPct: 0, autoReinvest: true,
  },
  {
    id: "br", type: "brokerage", name: "Roth", enabled: true,
    startingPrincipal: 500000, expectedAnnualReturnPct: 0.07, annualVolatilityPct: 0.15,
    withdrawalMode: "fixed_dollar", withdrawalAmount: 0, withdrawalPctOfStart: 0,
    taxTreatment: "tax_free", costBasis: 0,
  },
];

describe("full scenario aggregate", () => {
  const data = aggregate(projectAll(sources, settings));

  it("produces 60 months of data for a 5-year horizon", () => {
    expect(data.months.length).toBe(60);
  });

  it("monthly net is positive at year 1", () => {
    expect(data.totalNetByMonth[11]).toBeGreaterThan(0);
  });

  it("total principal grows: 5-year > start", () => {
    const startPrincipal = sources.reduce((acc, s) => {
      if (s.type === "dividend") return acc + s.principal;
      if (s.type === "hardmoney") return acc + s.principal;
      if (s.type === "brokerage") return acc + s.startingPrincipal;
      return acc;
    }, 0);
    const endingPrincipal = data.totalPrincipalByMonth[data.totalPrincipalByMonth.length - 1];
    expect(endingPrincipal).toBeGreaterThan(startPrincipal * 1.2);
  });

  it("taxes off: net increases for every income-producing source", () => {
    const taxedData = aggregate(projectAll(sources, settings));
    const noTaxData = aggregate(projectAll(sources, { ...settings, taxesEnabled: false }));
    // Sum of net over horizon must be higher when taxes are off
    const taxedSum = taxedData.totalNetByMonth.reduce((a, b) => a + b, 0);
    const noTaxSum = noTaxData.totalNetByMonth.reduce((a, b) => a + b, 0);
    expect(noTaxSum).toBeGreaterThan(taxedSum);
  });

  it("taxes off on a pure W2: net month 1 equals gross minus pretax deductions only", () => {
    const w2Only = [sources[0]];
    const data = aggregate(projectAll(w2Only, { ...settings, taxesEnabled: false }));
    // W2 gross biweekly 5000 -> monthly 5000*26/12 ≈ 10833.33; pretax 6% = 650
    // Expected net (no tax): 10833.33 - 650 = 10183.33
    expect(data.totalNetByMonth[0]).toBeCloseTo(10183.33, 0);
  });
});

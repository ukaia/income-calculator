import { z } from "zod";

export const filingStatusSchema = z.enum(["single", "mfj", "mfs", "hoh"]);
export const payFrequencySchema = z.enum(["weekly", "biweekly", "semimonthly", "monthly"]);

const paycheckW2 = z.object({
  id: z.string(),
  type: z.literal("w2"),
  name: z.string(),
  enabled: z.boolean().default(true),
  grossPerPeriod: z.number().nonnegative(),
  frequency: payFrequencySchema,
  fedRate: z.number().min(0).max(1),
  stateRate: z.number().min(0).max(1),
  noStateTax: z.boolean().default(false),
  pretax401kPct: z.number().min(0).max(1).default(0),
  hsaMonthly: z.number().nonnegative().default(0),
  healthPremiumMonthly: z.number().nonnegative().default(0),
  annualRaisePct: z.number().min(-1).max(1).default(0),
  raiseMonth: z.number().int().min(1).max(12).default(1),
});

const paycheck1099 = z.object({
  id: z.string(),
  type: z.literal("se1099"),
  name: z.string(),
  enabled: z.boolean().default(true),
  grossMonthly: z.number().nonnegative(),
  fedEffectiveRate: z.number().min(0).max(1),
  stateRate: z.number().min(0).max(1),
  noStateTax: z.boolean().default(false),
  businessExpensePct: z.number().min(0).max(1).default(0),
});

const dividend = z.object({
  id: z.string(),
  type: z.literal("dividend"),
  name: z.string(),
  enabled: z.boolean().default(true),
  principal: z.number().nonnegative(),
  annualYieldPct: z.number().min(0).max(1),
  frequency: z.enum(["monthly", "quarterly", "annual"]),
  qualifiedPct: z.number().min(0).max(1).default(1),
  growthPct: z.number().min(-1).max(1).default(0),
  drip: z.boolean().default(false),
  margin: z
    .object({
      enabled: z.boolean().default(false),
      balance: z.number().nonnegative().default(0),
      rate: z.number().min(0).max(1).default(0),
      maintenanceRatio: z.number().min(0).max(1).default(0.25),
      initialRatio: z.number().min(0).max(1).default(0.5),
    })
    .default({
      enabled: false,
      balance: 0,
      rate: 0,
      maintenanceRatio: 0.25,
      initialRatio: 0.5,
    }),
});

const hardMoney = z.object({
  id: z.string(),
  type: z.literal("hardmoney"),
  name: z.string(),
  enabled: z.boolean().default(true),
  principal: z.number().nonnegative(),
  annualRate: z.number().min(0).max(1),
  termMonths: z.number().int().positive(),
  paymentStructure: z.enum(["interest_only", "amortized", "balloon"]),
  returnOfPrincipalMonth: z.number().int().min(0),
  defaultProbPct: z.number().min(0).max(1).default(0),
  recoveryRatePct: z.number().min(0).max(1).default(0),
  originationPct: z.number().min(0).max(1).default(0),
  autoReinvest: z.boolean().default(false),
});

const brokerage = z.object({
  id: z.string(),
  type: z.literal("brokerage"),
  name: z.string(),
  enabled: z.boolean().default(true),
  startingPrincipal: z.number().nonnegative(),
  expectedAnnualReturnPct: z.number().min(-1).max(1),
  annualVolatilityPct: z.number().min(0).max(1).default(0.15),
  withdrawalMode: z.enum(["fixed_dollar", "fixed_pct", "inflation_adjusted"]),
  withdrawalAmount: z.number().nonnegative(),
  withdrawalPctOfStart: z.number().min(0).max(1).default(0.04),
  taxTreatment: z.enum(["taxable", "tax_deferred", "tax_free"]),
  costBasis: z.number().nonnegative().default(0),
});

export const sourceSchema = z.discriminatedUnion("type", [
  paycheckW2,
  paycheck1099,
  dividend,
  hardMoney,
  brokerage,
]);

export type Source = z.infer<typeof sourceSchema>;
export type W2Source = z.infer<typeof paycheckW2>;
export type SE1099Source = z.infer<typeof paycheck1099>;
export type DividendSource = z.infer<typeof dividend>;
export type HardMoneySource = z.infer<typeof hardMoney>;
export type BrokerageSource = z.infer<typeof brokerage>;

export const settingsSchema = z.object({
  inflationPct: z.number().min(0).max(1).default(0.03),
  viewRealDollars: z.boolean().default(false),
  filingStatus: filingStatusSchema.default("single"),
  state: z.string().default("NONE"),
  taxYear: z.number().int().min(2020).max(2100).default(2026),
  cashBuffer: z.number().nonnegative().default(0),
  monthlyExpenses: z.number().nonnegative().default(0),
  goalMonthlyNetIncome: z.number().nonnegative().default(0),
  darkMode: z.boolean().default(false),
  horizonYears: z.number().int().min(1).max(50).default(10),
});
export type Settings = z.infer<typeof settingsSchema>;

export const scenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  settings: settingsSchema,
  sources: z.array(sourceSchema),
});
export type Scenario = z.infer<typeof scenarioSchema>;

export const exportSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  activeScenarioId: z.string().nullable(),
  scenarios: z.array(scenarioSchema),
});
export type AppExport = z.infer<typeof exportSchema>;

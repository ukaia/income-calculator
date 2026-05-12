import { describe, expect, it } from "vitest";
import { buildScenarioCsv, safeFileName } from "@/lib/csv";
import { settingsSchema, type Scenario } from "@/lib/schema";

const scenario: Scenario = {
  id: "x",
  name: "Test",
  createdAt: 0,
  settings: settingsSchema.parse({ horizonYears: 2, taxYear: 2026, state: "NONE", monthlyExpenses: 1000 }),
  sources: [
    {
      id: "w2", type: "w2", name: "Day, job", enabled: true,
      grossPerPeriod: 4000, frequency: "biweekly",
      fedRate: 0.18, stateRate: 0, noStateTax: true,
      pretax401kPct: 0, hsaMonthly: 0, healthPremiumMonthly: 0,
      annualRaisePct: 0, raiseMonth: 1,
    },
  ],
};

describe("csv export", () => {
  it("has the expected header and one row per month", () => {
    const csv = buildScenarioCsv(scenario);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toMatch(/^month_index,month,total_gross,total_net,total_principal,monthly_expenses,surplus,/);
    // 2 years horizon = 24 rows + 1 header
    expect(lines.length).toBe(25);
  });

  it("sanitizes source name in column header", () => {
    const csv = buildScenarioCsv(scenario);
    const header = csv.split("\n")[0];
    expect(header).toContain("Day_job_gross");
    expect(header).not.toContain("Day, job");
  });

  it("monthly_expenses column equals scenario setting", () => {
    const csv = buildScenarioCsv(scenario);
    const firstRow = csv.split("\n")[1].split(",");
    // header order: month_index,month,total_gross,total_net,total_principal,monthly_expenses,surplus,...
    expect(firstRow[5]).toBe("1000");
  });

  it("surplus = total_net - expenses on each row", () => {
    const csv = buildScenarioCsv(scenario);
    const row = csv.split("\n")[3].split(","); // arbitrary row
    const totalNet = parseFloat(row[3]);
    const expenses = parseFloat(row[5]);
    const surplus = parseFloat(row[6]);
    expect(surplus).toBeCloseTo(totalNet - expenses, 1);
  });

  it("safeFileName strips problematic characters", () => {
    expect(safeFileName("My Plan v2!")).toBe("My-Plan-v2");
    expect(safeFileName("")).toBe("scenario");
  });
});

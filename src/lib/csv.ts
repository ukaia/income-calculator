import type { Scenario } from "@/lib/schema";
import { projectAll, aggregate } from "@/lib/calculations";

function escape(v: string | number): string {
  const s = typeof v === "number" ? (Number.isFinite(v) ? String(v) : "") : v;
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function monthLabel(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildScenarioCsv(scenario: Scenario): string {
  const projections = projectAll(scenario.sources, scenario.settings);
  const agg = aggregate(projections);

  const sourceCols: string[] = [];
  for (const p of projections) {
    const safe = (p.name || p.id).replace(/[^a-zA-Z0-9_]+/g, "_");
    sourceCols.push(`${safe}_gross`, `${safe}_net`, `${safe}_principal`);
  }

  const header = [
    "month_index",
    "month",
    "total_gross",
    "total_net",
    "total_principal",
    "monthly_expenses",
    "surplus",
    ...sourceCols,
  ];

  const rows: string[][] = [];
  const expenses = scenario.settings.monthlyExpenses;
  for (let i = 0; i < agg.months.length; i++) {
    const row: (string | number)[] = [
      i,
      monthLabel(i),
      round2(agg.totalGrossByMonth[i]),
      round2(agg.totalNetByMonth[i]),
      round2(agg.totalPrincipalByMonth[i]),
      round2(expenses),
      round2(agg.totalNetByMonth[i] - expenses),
    ];
    for (const p of projections) {
      const pt = p.points[i];
      row.push(round2(pt.gross), round2(pt.net), round2(pt.principal));
    }
    rows.push(row.map((v) => escape(v)));
  }

  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n") + "\n";
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "scenario";
}

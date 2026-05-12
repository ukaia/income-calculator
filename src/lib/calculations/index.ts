import { TAX_YEARS } from "@/constants/taxBrackets";
import { STATES } from "@/constants/states";
import type { Settings, Source } from "@/lib/schema";
import type { ProjectionContext, SourceProjection } from "./types";
import { projectW2 } from "./w2";
import { projectSE1099 } from "./se1099";
import { projectDividend } from "./dividend";
import { projectHardMoney } from "./hardmoney";
import { projectBrokerage } from "./brokerage";

export function buildContext(settings: Settings, horizonMonthsOverride?: number): ProjectionContext {
  const year = TAX_YEARS[settings.taxYear] ?? TAX_YEARS[2026];
  const stateRow = STATES.find((s) => s.code === settings.state);
  return {
    horizonMonths: horizonMonthsOverride ?? settings.horizonYears * 12,
    filingStatus: settings.filingStatus,
    year,
    stateRateOverride: stateRow?.estTopRate ?? 0,
    inflationPct: settings.inflationPct,
    taxesEnabled: settings.taxesEnabled ?? true,
  };
}

export function projectSource(
  source: Source,
  ctx: ProjectionContext,
  opts: { stressTest?: boolean } = {},
): SourceProjection {
  switch (source.type) {
    case "w2":
      return projectW2(source, ctx);
    case "se1099":
      return projectSE1099(source, ctx);
    case "dividend":
      return projectDividend(source, ctx);
    case "hardmoney":
      return projectHardMoney(source, ctx);
    case "brokerage":
      return projectBrokerage(source, ctx, opts);
  }
}

export function projectAll(
  sources: Source[],
  settings: Settings,
  opts: { stressTest?: boolean; horizonMonths?: number } = {},
): SourceProjection[] {
  const ctx = buildContext(settings, opts.horizonMonths);
  return sources.filter((s) => s.enabled).map((s) => projectSource(s, ctx, { stressTest: opts.stressTest }));
}

export interface PortfolioAggregate {
  months: number[];
  totalNetByMonth: number[];
  totalGrossByMonth: number[];
  totalPrincipalByMonth: number[];
  stackedNet: { month: number; values: Record<string, number> }[];
  projections: SourceProjection[];
}

export function aggregate(projections: SourceProjection[]): PortfolioAggregate {
  if (projections.length === 0) {
    return {
      months: [],
      totalNetByMonth: [],
      totalGrossByMonth: [],
      totalPrincipalByMonth: [],
      stackedNet: [],
      projections: [],
    };
  }
  const months = projections[0].points.map((p) => p.month);
  const totalNet = months.map(() => 0);
  const totalGross = months.map(() => 0);
  const totalPrincipal = months.map(() => 0);
  const stacked: { month: number; values: Record<string, number> }[] = months.map((m) => ({
    month: m,
    values: {},
  }));
  for (const p of projections) {
    p.points.forEach((pt, i) => {
      totalNet[i] += pt.net;
      totalGross[i] += pt.gross;
      totalPrincipal[i] += pt.principal;
      stacked[i].values[p.name || p.id] = pt.net;
    });
  }
  return {
    months,
    totalNetByMonth: totalNet,
    totalGrossByMonth: totalGross,
    totalPrincipalByMonth: totalPrincipal,
    stackedNet: stacked,
    projections,
  };
}

export * from "./types";

export interface MonthlyPoint {
  month: number; // 0-indexed from "now"
  gross: number;
  net: number;
  principal: number;
}

export interface SourceProjection {
  id: string;
  name: string;
  type: string;
  points: MonthlyPoint[]; // length = horizonMonths
  // Quick aggregates over the horizon
  monthlyNetMin: number;
  monthlyNetAvg: number;
  monthlyNetMax: number;
  monthlyGrossAvg: number;
  endingPrincipal: number;
  meta?: Record<string, number | string | boolean>;
}

export interface ProjectionContext {
  horizonMonths: number;
  filingStatus: import("@/constants/taxBrackets").FilingStatus;
  year: import("@/constants/taxBrackets").YearBrackets;
  stateRateOverride: number; // top marginal estimate
  inflationPct: number;
}

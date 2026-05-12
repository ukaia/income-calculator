export type FilingStatus = "single" | "mfj" | "mfs" | "hoh";

export interface Bracket {
  upTo: number; // taxable income upper bound for this rate; Infinity for top bracket
  rate: number; // marginal rate, e.g. 0.22
}

export interface YearBrackets {
  year: number;
  brackets: Record<FilingStatus, Bracket[]>;
  standardDeduction: Record<FilingStatus, number>;
  ssWageBase: number;
  additionalMedicareThreshold: Record<FilingStatus, number>;
}

// 2025 federal brackets (IRS published)
export const FED_2025: YearBrackets = {
  year: 2025,
  brackets: {
    single: [
      { upTo: 11925, rate: 0.10 },
      { upTo: 48475, rate: 0.12 },
      { upTo: 103350, rate: 0.22 },
      { upTo: 197300, rate: 0.24 },
      { upTo: 250525, rate: 0.32 },
      { upTo: 626350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    mfj: [
      { upTo: 23850, rate: 0.10 },
      { upTo: 96950, rate: 0.12 },
      { upTo: 206700, rate: 0.22 },
      { upTo: 394600, rate: 0.24 },
      { upTo: 501050, rate: 0.32 },
      { upTo: 751600, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    mfs: [
      { upTo: 11925, rate: 0.10 },
      { upTo: 48475, rate: 0.12 },
      { upTo: 103350, rate: 0.22 },
      { upTo: 197300, rate: 0.24 },
      { upTo: 250525, rate: 0.32 },
      { upTo: 375800, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    hoh: [
      { upTo: 17000, rate: 0.10 },
      { upTo: 64850, rate: 0.12 },
      { upTo: 103350, rate: 0.22 },
      { upTo: 197300, rate: 0.24 },
      { upTo: 250500, rate: 0.32 },
      { upTo: 626350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
  },
  standardDeduction: { single: 15000, mfj: 30000, mfs: 15000, hoh: 22500 },
  ssWageBase: 176100,
  additionalMedicareThreshold: { single: 200000, mfj: 250000, mfs: 125000, hoh: 200000 },
};

// 2026 federal brackets — projected with ~2.8% inflation adjustment.
// User can override these in Settings.
export const FED_2026: YearBrackets = {
  year: 2026,
  brackets: {
    single: [
      { upTo: 12260, rate: 0.10 },
      { upTo: 49832, rate: 0.12 },
      { upTo: 106244, rate: 0.22 },
      { upTo: 202824, rate: 0.24 },
      { upTo: 257540, rate: 0.32 },
      { upTo: 643888, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    mfj: [
      { upTo: 24518, rate: 0.10 },
      { upTo: 99664, rate: 0.12 },
      { upTo: 212487, rate: 0.22 },
      { upTo: 405649, rate: 0.24 },
      { upTo: 515079, rate: 0.32 },
      { upTo: 772645, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    mfs: [
      { upTo: 12260, rate: 0.10 },
      { upTo: 49832, rate: 0.12 },
      { upTo: 106244, rate: 0.22 },
      { upTo: 202824, rate: 0.24 },
      { upTo: 257540, rate: 0.32 },
      { upTo: 386322, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
    hoh: [
      { upTo: 17476, rate: 0.10 },
      { upTo: 66666, rate: 0.12 },
      { upTo: 106244, rate: 0.22 },
      { upTo: 202824, rate: 0.24 },
      { upTo: 257514, rate: 0.32 },
      { upTo: 643888, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
  },
  standardDeduction: { single: 15420, mfj: 30840, mfs: 15420, hoh: 23130 },
  ssWageBase: 181025,
  additionalMedicareThreshold: { single: 200000, mfj: 250000, mfs: 125000, hoh: 200000 },
};

export const TAX_YEARS: Record<number, YearBrackets> = {
  2025: FED_2025,
  2026: FED_2026,
};

export function parseNumeric(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === "number") return isFinite(input) ? input : 0;
  const cleaned = input.replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : 0;
}

export function formatCurrency(n: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  if (!isFinite(n)) return "$0";
  const { compact = false, decimals = 0 } = opts;
  if (compact && Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  }
  if (compact && Math.abs(n) >= 10_000) {
    return `$${(n / 1_000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatPercent(n: number, decimals = 2): string {
  if (!isFinite(n)) return "0%";
  return `${(n * 100).toFixed(decimals)}%`;
}

export function formatNumber(n: number, decimals = 0): string {
  if (!isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function toReal(nominal: number, annualInflation: number, monthsFromNow: number): number {
  if (annualInflation <= 0) return nominal;
  return nominal / Math.pow(1 + annualInflation, monthsFromNow / 12);
}

export function payFrequencyToMonthly(amountPerPeriod: number, frequency: PayFrequency): number {
  switch (frequency) {
    case "weekly":
      return (amountPerPeriod * 52) / 12;
    case "biweekly":
      return (amountPerPeriod * 26) / 12;
    case "semimonthly":
      return amountPerPeriod * 2;
    case "monthly":
      return amountPerPeriod;
  }
}

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export const CHART_COLORS = [
  "#22d3ee",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#fb7185",
  "#a3e635",
];

export function colorFor(i: number): string {
  return CHART_COLORS[i % CHART_COLORS.length];
}

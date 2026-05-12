import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { PortfolioAggregate } from "@/lib/calculations";
import { colorFor } from "./colors";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  data: PortfolioAggregate;
  isMobile: boolean;
}

export function StackedNetIncome({ data, isMobile }: Props) {
  if (data.projections.length === 0) {
    return <div className="text-sm text-muted-foreground p-4">Add a source to see this chart.</div>;
  }

  // Collapse to top 3 + Other on mobile if many sources
  const allSeries = data.projections.map((p) => ({ key: p.name || p.id, total: p.points.reduce((a, b) => a + b.net, 0) }));
  const ranked = [...allSeries].sort((a, b) => b.total - a.total);
  const useTop = isMobile && allSeries.length > 5;
  const topKeys = useTop ? new Set(ranked.slice(0, 3).map((s) => s.key)) : new Set(allSeries.map((s) => s.key));

  const chartData = data.stackedNet.map((row) => {
    const out: Record<string, number | string> = { month: monthLabel(row.month) };
    let other = 0;
    for (const [k, v] of Object.entries(row.values)) {
      if (topKeys.has(k)) out[k] = v;
      else other += v;
    }
    if (useTop) out["Other"] = other;
    return out;
  });

  const seriesKeys = useTop
    ? [...Array.from(topKeys), "Other"]
    : Array.from(new Set(data.stackedNet.flatMap((r) => Object.keys(r.values))));

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
      <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={isMobile ? "preserveStartEnd" : "preserveEnd"} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatCurrency(v, { compact: true })}
          width={isMobile ? 50 : 64}
        />
        <Tooltip
          formatter={(v: number) => formatCurrency(v)}
          contentStyle={{ fontSize: 12 }}
        />
        {!isMobile && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {seriesKeys.map((k, i) => (
          <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={colorFor(i)} fill={colorFor(i)} fillOpacity={0.5} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function monthLabel(m: number): string {
  const yr = Math.floor(m / 12);
  const mo = m % 12;
  if (mo === 0) return `Y${yr + 1}`;
  return "";
}

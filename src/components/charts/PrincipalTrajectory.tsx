import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PortfolioAggregate } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  data: PortfolioAggregate;
  isMobile: boolean;
  showReal?: boolean;
  inflationPct?: number;
}

export function PrincipalTrajectory({ data, isMobile, showReal, inflationPct = 0 }: Props) {
  if (!data.months.length) {
    return <div className="text-sm text-muted-foreground p-4">No data yet.</div>;
  }
  const chartData = data.months.map((m, i) => {
    const nominal = data.totalPrincipalByMonth[i];
    const value = showReal ? nominal / Math.pow(1 + inflationPct, m / 12) : nominal;
    return { month: m, label: m % 12 === 0 ? `Y${Math.floor(m / 12) + 1}` : "", value };
  });

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => formatCurrency(v, { compact: true })}
          width={isMobile ? 50 : 64}
        />
        <Tooltip
          formatter={(v: number) => formatCurrency(v)}
          labelFormatter={(_, p) => {
            const m = (p?.[0]?.payload as { month: number } | undefined)?.month ?? 0;
            return `Month ${m + 1}`;
          }}
          contentStyle={{ fontSize: 12 }}
        />
        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

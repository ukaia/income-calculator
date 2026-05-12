import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { PortfolioAggregate } from "@/lib/calculations";
import { colorFor } from "./colors";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  data: PortfolioAggregate;
  isMobile: boolean;
}

export function SourceMixPie({ data, isMobile }: Props) {
  const current = data.projections.map((p) => ({
    name: p.name || p.id,
    value: Math.max(0, p.points[0]?.net ?? 0),
  })).filter((d) => d.value > 0);

  if (!current.length) {
    return <div className="text-sm text-muted-foreground p-4">No income this month.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 240 : 260}>
      <PieChart>
        <Pie
          data={current}
          dataKey="value"
          nameKey="name"
          innerRadius={isMobile ? 40 : 50}
          outerRadius={isMobile ? 70 : 90}
          paddingAngle={2}
        >
          {current.map((_, i) => (
            <Cell key={i} fill={colorFor(i)} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12 }} />
        <Legend
          verticalAlign={isMobile ? "bottom" : "middle"}
          align={isMobile ? "center" : "right"}
          layout={isMobile ? "horizontal" : "vertical"}
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import type { PortfolioAggregate } from "@/lib/calculations";
import { formatCurrency, toReal } from "@/lib/formatters";

interface Props {
  data: PortfolioAggregate;
  monthlyExpenses: number;
  showReal: boolean;
  inflationPct: number;
}

export function SummaryCards({ data, monthlyExpenses, showReal, inflationPct }: Props) {
  if (!data.months.length) return null;

  const nets = data.totalNetByMonth;
  const grosses = data.totalGrossByMonth;
  const min = Math.min(...nets);
  const max = Math.max(...nets);
  const avg = nets.reduce((a, b) => a + b, 0) / nets.length;
  const grossAvg = grosses.reduce((a, b) => a + b, 0) / grosses.length;
  const surplus = avg - monthlyExpenses;

  const transform = (n: number, month: number) => (showReal ? toReal(n, inflationPct, month) : n);

  const principalAt = (months: number) => {
    const idx = Math.min(months - 1, data.totalPrincipalByMonth.length - 1);
    return idx >= 0 ? transform(data.totalPrincipalByMonth[idx], idx) : 0;
  };

  const items = [
    { label: "Avg monthly net", value: formatCurrency(avg, { compact: true }), hint: `${formatCurrency(min, { compact: true })} – ${formatCurrency(max, { compact: true })}` },
    { label: "Avg monthly gross", value: formatCurrency(grossAvg, { compact: true }), hint: "Pre-tax across all sources" },
    { label: "Net surplus", value: formatCurrency(surplus, { compact: true }), hint: `After ${formatCurrency(monthlyExpenses, { compact: true })} expenses`, tone: surplus < 0 ? "destructive" : undefined },
    { label: "Principal @ 1y", value: formatCurrency(principalAt(12), { compact: true }), hint: showReal ? "real $" : "nominal $" },
    { label: "Principal @ 2y", value: formatCurrency(principalAt(24), { compact: true }), hint: showReal ? "real $" : "nominal $" },
    { label: "Principal @ 5y", value: formatCurrency(principalAt(60), { compact: true }), hint: showReal ? "real $" : "nominal $" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((it) => (
        <Card key={it.label}>
          <CardContent className="p-3 sm:p-4">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.label}</div>
            <div className={`mt-1 text-lg sm:text-xl font-semibold ${it.tone === "destructive" ? "text-destructive" : ""}`}>
              {it.value}
            </div>
            <div className="text-xs text-muted-foreground truncate">{it.hint}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

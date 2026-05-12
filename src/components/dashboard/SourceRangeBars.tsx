import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioAggregate } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  data: PortfolioAggregate;
}

export function SourceRangeBars({ data }: Props) {
  if (!data.projections.length) return null;

  const allMaxes = data.projections.map((p) => p.monthlyNetMax);
  const globalMax = Math.max(1, ...allMaxes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Per-source monthly range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.projections.map((p) => {
          const minPct = (p.monthlyNetMin / globalMax) * 100;
          const avgPct = (p.monthlyNetAvg / globalMax) * 100;
          const maxPct = (p.monthlyNetMax / globalMax) * 100;
          return (
            <div key={p.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(p.monthlyNetMin, { compact: true })} – {formatCurrency(p.monthlyNetMax, { compact: true })}
                </span>
              </div>
              <div className="relative h-2 rounded bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 bg-primary/30"
                  style={{ left: `${minPct}%`, width: `${Math.max(2, maxPct - minPct)}%` }}
                />
                <div
                  className="absolute inset-y-0 w-1 bg-primary"
                  style={{ left: `${avgPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

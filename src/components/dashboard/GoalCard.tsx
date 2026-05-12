import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioAggregate } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  data: PortfolioAggregate;
  goal: number;
}

export function GoalCard({ data, goal }: Props) {
  if (goal <= 0) return null;
  const idx = data.totalNetByMonth.findIndex((v) => v >= goal);
  const reached = idx >= 0;
  const monthLabel = reached
    ? `Month ${idx + 1} (Year ${Math.floor(idx / 12) + 1})`
    : "Not reached in horizon";
  const currentNet = data.totalNetByMonth[0] ?? 0;
  const pct = Math.min(100, (currentNet / goal) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal: {formatCurrency(goal, { compact: true })} / month net</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          {reached ? (
            <span className="text-emerald-500 font-medium">Reached at {monthLabel}.</span>
          ) : (
            <span className="text-amber-500 font-medium">{monthLabel}.</span>
          )}
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Current: {formatCurrency(currentNet, { compact: true })}</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioAggregate } from "@/lib/calculations";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface Props {
  data: PortfolioAggregate;
}

export function MarginCallCard({ data }: Props) {
  const marginSources = data.projections.filter((p) => p.meta && "dropToCallPct" in p.meta);
  if (!marginSources.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Margin call simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {marginSources.map((p) => {
          const m = p.meta!;
          return (
            <div key={p.id} className="rounded border p-3 space-y-2">
              <div className="font-medium text-sm">{p.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Stat label="Net yield after margin" value={formatPercent(Number(m.netYieldAfterMargin))} />
                <Stat label="Monthly margin interest" value={formatCurrency(Number(m.marginMonthlyInterest))} />
                <Stat label="Portfolio drop to call" value={formatPercent(Number(m.dropToCallPct))} tone={Number(m.dropToCallPct) < 0.15 ? "warn" : undefined} />
                <Stat label="Liquidation price" value={formatCurrency(Number(m.liquidationPrice))} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold ${tone === "warn" ? "text-amber-500" : ""}`}>{value}</div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Settings, Source } from "@/lib/schema";
import { projectAll, aggregate } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  sources: Source[];
  settings: Settings;
}

export function StressTestCard({ sources, settings }: Props) {
  const hasBrokerage = sources.some((s) => s.type === "brokerage" && s.enabled);
  if (!hasBrokerage) return null;

  const stressed = aggregate(projectAll(sources, settings, { stressTest: true }));
  const principal = stressed.totalPrincipalByMonth;
  const at = (m: number) => principal[Math.min(m - 1, principal.length - 1)] ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sequence-of-returns stress test</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Applies a worst-12-month return in months 1–12, second-worst in months 13–24, then baseline.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Stressed @ 1y" value={formatCurrency(at(12), { compact: true })} />
          <Stat label="Stressed @ 2y" value={formatCurrency(at(24), { compact: true })} />
          <Stat label="Stressed @ 5y" value={formatCurrency(at(60), { compact: true })} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

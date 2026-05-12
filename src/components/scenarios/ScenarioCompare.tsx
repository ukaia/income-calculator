import * as React from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useStore } from "@/store/useStore";
import { projectAll, aggregate } from "@/lib/calculations";
import { colorFor } from "@/components/charts/colors";
import { formatCurrency } from "@/lib/formatters";

export function ScenarioCompare() {
  const scenarios = useStore((s) => s.scenarios);
  const [picked, setPicked] = React.useState<string[]>([]);

  const toggle = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const compared = scenarios.filter((s) => picked.includes(s.id));

  const principalData = React.useMemo(() => {
    if (!compared.length) return [];
    const lengths: number[] = compared.map((s) => aggregate(projectAll(s.sources, s.settings)).totalPrincipalByMonth.length);
    const maxLen = Math.max(0, ...lengths);
    const series = compared.map((s) => ({
      id: s.id,
      name: s.name,
      values: aggregate(projectAll(s.sources, s.settings)).totalPrincipalByMonth,
    }));
    return Array.from({ length: maxLen }, (_, i) => {
      const row: Record<string, number | string> = { label: i % 12 === 0 ? `Y${Math.floor(i / 12) + 1}` : "" };
      for (const s of series) row[s.name] = s.values[i] ?? 0;
      return row;
    });
  }, [compared]);

  const netData = React.useMemo(() => {
    if (!compared.length) return [];
    const series = compared.map((s) => ({
      name: s.name,
      values: aggregate(projectAll(s.sources, s.settings)).totalNetByMonth,
    }));
    const maxLen = Math.max(0, ...series.map((s) => s.values.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const row: Record<string, number | string> = { label: i % 12 === 0 ? `Y${Math.floor(i / 12) + 1}` : "" };
      for (const s of series) row[s.name] = s.values[i] ?? 0;
      return row;
    });
  }, [compared]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {scenarios.map((s) => {
          const checked = picked.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`rounded-full border px-3 py-1.5 text-xs min-h-[44px] sm:min-h-0 ${
                checked ? "bg-primary text-primary-foreground border-primary" : "bg-card"
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {compared.length > 0 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Principal over time</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={principalData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, { compact: true })} width={56} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {compared.map((s, i) => (
                  <Line key={s.id} type="monotone" dataKey={s.name} stroke={colorFor(i)} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Monthly net income</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={netData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, { compact: true })} width={56} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {compared.map((s, i) => (
                  <Line key={s.id} type="monotone" dataKey={s.name} stroke={colorFor(i)} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {compared.map((s) => {
              const data = aggregate(projectAll(s.sources, s.settings));
              const avgNet = data.totalNetByMonth.length ? data.totalNetByMonth.reduce((a, b) => a + b, 0) / data.totalNetByMonth.length : 0;
              const endPrincipal = data.totalPrincipalByMonth[data.totalPrincipalByMonth.length - 1] ?? 0;
              return (
                <div key={s.id} className="rounded border p-3">
                  <div className="font-medium text-sm mb-2">{s.name}</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg net/mo</span><span>{formatCurrency(avgNet, { compact: true })}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ending principal</span><span>{formatCurrency(endPrincipal, { compact: true })}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Sources</span><span>{s.sources.length}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

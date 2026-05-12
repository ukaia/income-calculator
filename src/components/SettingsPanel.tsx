import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput, PercentInput, IntInput } from "@/components/ui/money-input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { STATES } from "@/constants/states";
import { TAX_YEARS } from "@/constants/taxBrackets";
import { exportSchema } from "@/lib/schema";

export function SettingsPanel() {
  const active = useStore((s) => s.getActive());
  const update = useStore((s) => s.updateActiveSettings);
  const resetAll = useStore((s) => s.resetAll);
  const replaceAll = useStore((s) => s.replaceAll);

  const onExport = () => {
    const state = useStore.getState();
    const payload = {
      schemaVersion: 1 as const,
      exportedAt: new Date().toISOString(),
      activeScenarioId: state.activeScenarioId,
      scenarios: state.scenarios,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = exportSchema.parse(JSON.parse(String(reader.result)));
        replaceAll({ scenarios: parsed.scenarios, activeScenarioId: parsed.activeScenarioId });
        alert(`Imported ${parsed.scenarios.length} scenario(s).`);
      } catch (e) {
        alert(`Import failed: ${(e as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  const onReset = () => {
    if (confirm("Reset all scenarios and settings? This cannot be undone.")) {
      resetAll();
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Global settings</CardTitle>
          <CardDescription>Applied to the active scenario.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Inflation rate (annual)" help="Used for real-dollar view and inflation-adjusted withdrawals.">
            <PercentInput value={active.settings.inflationPct} onChange={(n) => update({ inflationPct: n })} />
          </Field>
          <Field label="View dollars">
            <Select
              value={active.settings.viewRealDollars ? "real" : "nominal"}
              onValueChange={(v) => update({ viewRealDollars: v === "real" })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nominal">Nominal</SelectItem>
                <SelectItem value="real">Real (inflation-adjusted)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Filing status">
            <Select value={active.settings.filingStatus} onValueChange={(v) => update({ filingStatus: v as "single" | "mfj" | "mfs" | "hoh" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="mfj">Married filing jointly</SelectItem>
                <SelectItem value="mfs">Married filing separately</SelectItem>
                <SelectItem value="hoh">Head of household</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="State">
            <Select value={active.settings.state} onValueChange={(v) => update({ state: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tax year">
            <Select value={String(active.settings.taxYear)} onValueChange={(v) => update({ taxYear: parseInt(v, 10) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(TAX_YEARS).map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Horizon (years)">
            <IntInput value={active.settings.horizonYears} onChange={(n) => update({ horizonYears: Math.min(50, Math.max(1, n || 1)) })} suffix="yr" />
          </Field>
          <Field label="Monthly expenses">
            <MoneyInput value={active.settings.monthlyExpenses} onChange={(n) => update({ monthlyExpenses: n })} />
          </Field>
          <Field label="Cash buffer / emergency fund" help="Sits outside calculations; displayed as a separate line.">
            <MoneyInput value={active.settings.cashBuffer} onChange={(n) => update({ cashBuffer: n })} />
          </Field>
          <Field label="Goal: target monthly net" help="Dashboard shows when projection reaches this amount.">
            <MoneyInput value={active.settings.goalMonthlyNetIncome} onChange={(n) => update({ goalMonthlyNetIncome: n })} />
          </Field>
          <Field label="Dark mode">
            <div className="flex items-center h-11">
              <Switch checked={active.settings.darkMode} onCheckedChange={(v) => update({ darkMode: v })} />
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>Everything is local. Export anywhere, import to migrate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={onExport} variant="outline">Export JSON</Button>
            <label className="inline-flex">
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImport(f);
                  e.target.value = "";
                }}
              />
              <span className="inline-flex h-11 px-4 items-center rounded-md border border-input bg-background text-sm font-medium cursor-pointer hover:bg-accent">
                Import JSON
              </span>
            </label>
            <Button variant="destructive" onClick={onReset}>Reset all</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Data is stored in your browser's localStorage. Nothing leaves your device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

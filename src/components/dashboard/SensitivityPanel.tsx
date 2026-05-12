import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { formatPercent } from "@/lib/formatters";

const ROWS: { key: keyof ReturnType<typeof useStore.getState>["sensitivity"]; label: string; min: number; max: number; step: number; description: string }[] = [
  { key: "dividendYieldDelta", label: "Dividend yield Δ", min: -0.05, max: 0.05, step: 0.0025, description: "Shifts every dividend source's yield by this amount." },
  { key: "marginRateDelta", label: "Margin rate Δ", min: -0.05, max: 0.05, step: 0.0025, description: "Shifts margin interest rate." },
  { key: "marketReturnDelta", label: "Market return Δ", min: -0.1, max: 0.1, step: 0.0025, description: "Shifts brokerage expected return." },
  { key: "inflationDelta", label: "Inflation Δ", min: -0.03, max: 0.05, step: 0.0025, description: "Shifts global inflation rate." },
];

export function SensitivityPanel() {
  const [open, setOpen] = React.useState(false);
  const sens = useStore((s) => s.sensitivity);
  const setSensitivity = useStore((s) => s.setSensitivity);
  const reset = useStore((s) => s.resetSensitivity);

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center justify-between">
          <CardTitle>Sensitivity sliders</CardTitle>
          <Button variant="ghost" size="sm">{open ? "Hide" : "Show"}</Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          {ROWS.map((r) => (
            <div key={r.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{r.label}</span>
                <span className="text-muted-foreground">{formatPercent(sens[r.key], 2)}</span>
              </div>
              <input
                type="range"
                min={r.min}
                max={r.max}
                step={r.step}
                value={sens[r.key]}
                onChange={(e) => setSensitivity({ [r.key]: parseFloat(e.target.value) } as Partial<typeof sens>)}
                className="w-full"
                aria-label={r.label}
              />
              <div className="text-[10px] text-muted-foreground">{r.description}</div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={reset}>Reset</Button>
        </CardContent>
      )}
    </Card>
  );
}

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput, PercentInput } from "@/components/ui/money-input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { DividendSource } from "@/lib/schema";

interface Props {
  source: DividendSource;
  onChange: (patch: Partial<DividendSource>) => void;
}

export function DividendForm({ source, onChange }: Props) {
  const margin = source.margin;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Source name">
          <Input value={source.name} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>
        <Field label="Principal invested">
          <MoneyInput value={source.principal} onChange={(n) => onChange({ principal: n })} />
        </Field>
        <Field label="Annual yield">
          <PercentInput value={source.annualYieldPct} onChange={(n) => onChange({ annualYieldPct: n })} />
        </Field>
        <Field label="Payment frequency">
          <Select value={source.frequency} onValueChange={(v) => onChange({ frequency: v as DividendSource["frequency"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Qualified portion" help="Portion of dividends taxed at LTCG rates (default 15%) vs ordinary income.">
          <PercentInput value={source.qualifiedPct} onChange={(n) => onChange({ qualifiedPct: n })} />
        </Field>
        <Field label="Dividend growth (annual)">
          <PercentInput value={source.growthPct} onChange={(n) => onChange({ growthPct: n })} />
        </Field>
        <Field label="DRIP" help="If on, net dividends are reinvested into principal each month.">
          <div className="flex items-center h-11">
            <Switch checked={source.drip} onCheckedChange={(v) => onChange({ drip: v })} />
          </div>
        </Field>
      </div>

      <div className="rounded-lg border border-dashed p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Margin</div>
            <div className="text-xs text-muted-foreground">Borrowed funds against this position.</div>
          </div>
          <Switch
            checked={margin.enabled}
            onCheckedChange={(v) => onChange({ margin: { ...margin, enabled: v } })}
          />
        </div>
        {margin.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Margin balance">
              <MoneyInput value={margin.balance} onChange={(n) => onChange({ margin: { ...margin, balance: n } })} />
            </Field>
            <Field label="Margin rate (annual)">
              <PercentInput value={margin.rate} onChange={(n) => onChange({ margin: { ...margin, rate: n } })} />
            </Field>
            <Field label="Maintenance margin ratio">
              <PercentInput value={margin.maintenanceRatio} onChange={(n) => onChange({ margin: { ...margin, maintenanceRatio: n } })} />
            </Field>
            <Field label="Initial margin ratio">
              <PercentInput value={margin.initialRatio} onChange={(n) => onChange({ margin: { ...margin, initialRatio: n } })} />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}

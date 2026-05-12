import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput, PercentInput, IntInput } from "@/components/ui/money-input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { W2Source } from "@/lib/schema";

interface Props {
  source: W2Source;
  onChange: (patch: Partial<W2Source>) => void;
}

export function W2Form({ source, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Source name">
        <Input value={source.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Field>
      <Field label="Pay frequency">
        <Select value={source.frequency} onValueChange={(v) => onChange({ frequency: v as W2Source["frequency"] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Biweekly</SelectItem>
            <SelectItem value="semimonthly">Semimonthly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Gross per pay period" help="Pre-tax pay each pay period. Monthly is computed from frequency.">
        <MoneyInput value={source.grossPerPeriod} onChange={(n) => onChange({ grossPerPeriod: n })} />
      </Field>
      <Field label="Federal withholding rate" help="Your effective federal withholding rate. Used until taxable income is calculated annually.">
        <PercentInput value={source.fedRate} onChange={(n) => onChange({ fedRate: n })} />
      </Field>
      <Field label="State withholding rate">
        <PercentInput value={source.stateRate} onChange={(n) => onChange({ stateRate: n })} />
      </Field>
      <Field label="No state tax">
        <div className="flex items-center h-11">
          <Switch checked={source.noStateTax} onCheckedChange={(v) => onChange({ noStateTax: v })} />
        </div>
      </Field>
      <Field label="401(k) pre-tax %" help="Percentage of gross deferred to 401(k). Reduces federal/state taxable income.">
        <PercentInput value={source.pretax401kPct} onChange={(n) => onChange({ pretax401kPct: n })} />
      </Field>
      <Field label="HSA $/month" help="Pre-tax HSA contribution per month.">
        <MoneyInput value={source.hsaMonthly} onChange={(n) => onChange({ hsaMonthly: n })} />
      </Field>
      <Field label="Health premium $/month">
        <MoneyInput value={source.healthPremiumMonthly} onChange={(n) => onChange({ healthPremiumMonthly: n })} />
      </Field>
      <Field label="Annual raise %">
        <PercentInput value={source.annualRaisePct} onChange={(n) => onChange({ annualRaisePct: n })} />
      </Field>
      <Field label="Raise month (1–12)" help="Month of the year the raise takes effect.">
        <IntInput value={source.raiseMonth} onChange={(n) => onChange({ raiseMonth: Math.min(12, Math.max(1, n || 1)) })} />
      </Field>
    </div>
  );
}

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput, PercentInput } from "@/components/ui/money-input";
import { Switch } from "@/components/ui/switch";
import type { SE1099Source } from "@/lib/schema";

interface Props {
  source: SE1099Source;
  onChange: (patch: Partial<SE1099Source>) => void;
}

export function SE1099Form({ source, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Source name">
        <Input value={source.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Field>
      <Field label="Gross monthly income">
        <MoneyInput value={source.grossMonthly} onChange={(n) => onChange({ grossMonthly: n })} />
      </Field>
      <Field label="Business expenses %" help="Percent of gross that is deductible business expense.">
        <PercentInput value={source.businessExpensePct} onChange={(n) => onChange({ businessExpensePct: n })} />
      </Field>
      <Field label="Federal effective rate" help="Estimated federal income tax rate on net SE earnings.">
        <PercentInput value={source.fedEffectiveRate} onChange={(n) => onChange({ fedEffectiveRate: n })} />
      </Field>
      <Field label="State rate">
        <PercentInput value={source.stateRate} onChange={(n) => onChange({ stateRate: n })} />
      </Field>
      <Field label="No state tax">
        <div className="flex items-center h-11">
          <Switch checked={source.noStateTax} onCheckedChange={(v) => onChange({ noStateTax: v })} />
        </div>
      </Field>
    </div>
  );
}

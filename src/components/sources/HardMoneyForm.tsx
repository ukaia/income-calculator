import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput, PercentInput, IntInput } from "@/components/ui/money-input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { HardMoneySource } from "@/lib/schema";

interface Props {
  source: HardMoneySource;
  onChange: (patch: Partial<HardMoneySource>) => void;
}

export function HardMoneyForm({ source, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Source name">
        <Input value={source.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Field>
      <Field label="Principal lent">
        <MoneyInput value={source.principal} onChange={(n) => onChange({ principal: n })} />
      </Field>
      <Field label="Annual rate">
        <PercentInput value={source.annualRate} onChange={(n) => onChange({ annualRate: n })} />
      </Field>
      <Field label="Term (months)">
        <IntInput value={source.termMonths} onChange={(n) => onChange({ termMonths: Math.max(1, n) })} suffix="mo" />
      </Field>
      <Field label="Payment structure">
        <Select value={source.paymentStructure} onValueChange={(v) => onChange({ paymentStructure: v as HardMoneySource["paymentStructure"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="interest_only">Interest-only</SelectItem>
            <SelectItem value="amortized">Amortized</SelectItem>
            <SelectItem value="balloon">Balloon</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Return-of-principal month" help="Month index when the principal returns (for interest-only/balloon).">
        <IntInput value={source.returnOfPrincipalMonth} onChange={(n) => onChange({ returnOfPrincipalMonth: Math.max(0, n) })} suffix="mo" />
      </Field>
      <Field label="Default probability">
        <PercentInput value={source.defaultProbPct} onChange={(n) => onChange({ defaultProbPct: n })} />
      </Field>
      <Field label="Recovery rate if default">
        <PercentInput value={source.recoveryRatePct} onChange={(n) => onChange({ recoveryRatePct: n })} />
      </Field>
      <Field label="Origination fee / points" help="Paid up-front in month 0 as a percent of principal.">
        <PercentInput value={source.originationPct} onChange={(n) => onChange({ originationPct: n })} />
      </Field>
      <Field label="Auto-reinvest" help="When principal returns, roll into a new loan at same terms.">
        <div className="flex items-center h-11">
          <Switch checked={source.autoReinvest} onCheckedChange={(v) => onChange({ autoReinvest: v })} />
        </div>
      </Field>
    </div>
  );
}

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MoneyInput, PercentInput } from "@/components/ui/money-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { BrokerageSource } from "@/lib/schema";

interface Props {
  source: BrokerageSource;
  onChange: (patch: Partial<BrokerageSource>) => void;
}

export function BrokerageForm({ source, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Source name">
        <Input value={source.name} onChange={(e) => onChange({ name: e.target.value })} />
      </Field>
      <Field label="Starting principal">
        <MoneyInput value={source.startingPrincipal} onChange={(n) => onChange({ startingPrincipal: n })} />
      </Field>
      <Field label="Expected annual return">
        <PercentInput value={source.expectedAnnualReturnPct} onChange={(n) => onChange({ expectedAnnualReturnPct: n })} />
      </Field>
      <Field label="Annual volatility" help="Used in the sequence-of-returns stress test only.">
        <PercentInput value={source.annualVolatilityPct} onChange={(n) => onChange({ annualVolatilityPct: n })} />
      </Field>
      <Field label="Withdrawal mode">
        <Select
          value={source.withdrawalMode}
          onValueChange={(v) => onChange({ withdrawalMode: v as BrokerageSource["withdrawalMode"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed_dollar">Fixed $ / month</SelectItem>
            <SelectItem value="fixed_pct">Fixed % of starting principal / yr</SelectItem>
            <SelectItem value="inflation_adjusted">Inflation-adjusted $</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {source.withdrawalMode === "fixed_pct" ? (
        <Field label="Withdrawal % per year">
          <PercentInput value={source.withdrawalPctOfStart} onChange={(n) => onChange({ withdrawalPctOfStart: n })} />
        </Field>
      ) : (
        <Field label="Withdrawal $/month">
          <MoneyInput value={source.withdrawalAmount} onChange={(n) => onChange({ withdrawalAmount: n })} />
        </Field>
      )}
      <Field label="Tax treatment">
        <Select
          value={source.taxTreatment}
          onValueChange={(v) => onChange({ taxTreatment: v as BrokerageSource["taxTreatment"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="taxable">Taxable (LTCG)</SelectItem>
            <SelectItem value="tax_deferred">Tax-deferred (Traditional)</SelectItem>
            <SelectItem value="tax_free">Tax-free (Roth)</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {source.taxTreatment === "taxable" && (
        <Field label="Cost basis" help="Used to compute the capital gain portion of each withdrawal.">
          <MoneyInput value={source.costBasis} onChange={(n) => onChange({ costBasis: n })} />
        </Field>
      )}
    </div>
  );
}

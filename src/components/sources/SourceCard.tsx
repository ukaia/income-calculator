import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Copy, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Source } from "@/lib/schema";
import { useStore } from "@/store/useStore";
import { W2Form } from "./W2Form";
import { SE1099Form } from "./SE1099Form";
import { DividendForm } from "./DividendForm";
import { HardMoneyForm } from "./HardMoneyForm";
import { BrokerageForm } from "./BrokerageForm";

const TYPE_LABELS: Record<Source["type"], string> = {
  w2: "W2 Paycheck",
  se1099: "1099 / Self-Employed",
  dividend: "Dividend Income",
  hardmoney: "Hard Money Loan",
  brokerage: "Brokerage Withdrawal",
};

interface Props {
  source: Source;
}

export function SourceCard({ source }: Props) {
  const updateSource = useStore((s) => s.updateSource);
  const removeSource = useStore((s) => s.removeSource);
  const duplicateSource = useStore((s) => s.duplicateSource);
  const [open, setOpen] = React.useState(true);

  const onChange = (patch: Partial<Source>) => updateSource(source.id, patch as Partial<Source>);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 text-left flex-1 min-h-[44px]"
            aria-expanded={open}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <div>
              <div className="font-semibold text-sm">{source.name || TYPE_LABELS[source.type]}</div>
              <div className="text-xs text-muted-foreground">{TYPE_LABELS[source.type]}</div>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <Switch
              checked={source.enabled}
              onCheckedChange={(v) => onChange({ enabled: v })}
              aria-label="Enable source"
            />
            <Button variant="ghost" size="icon" onClick={() => duplicateSource(source.id)} aria-label="Duplicate">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => removeSource(source.id)} aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent>
          {source.type === "w2" && <W2Form source={source} onChange={onChange as never} />}
          {source.type === "se1099" && <SE1099Form source={source} onChange={onChange as never} />}
          {source.type === "dividend" && <DividendForm source={source} onChange={onChange as never} />}
          {source.type === "hardmoney" && <HardMoneyForm source={source} onChange={onChange as never} />}
          {source.type === "brokerage" && <BrokerageForm source={source} onChange={onChange as never} />}
        </CardContent>
      )}
    </Card>
  );
}

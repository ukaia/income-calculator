import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useStore } from "@/store/useStore";
import { uid } from "@/lib/utils";
import type { Source } from "@/lib/schema";

const TYPES: { type: Source["type"]; label: string; description: string }[] = [
  { type: "w2", label: "W2 Paycheck", description: "Regular employer paycheck with withholding" },
  { type: "se1099", label: "1099 / Self-Employed", description: "Includes SE tax + estimated quarterly" },
  { type: "dividend", label: "Dividend Income", description: "Yielding portfolio, optional margin" },
  { type: "hardmoney", label: "Hard Money Loan", description: "Lending capital at a fixed rate" },
  { type: "brokerage", label: "Brokerage Withdrawal", description: "Drawing down a market portfolio" },
];

function defaultSource(type: Source["type"]): Source {
  const id = uid();
  switch (type) {
    case "w2":
      return {
        id, type, name: "Day job", enabled: true,
        grossPerPeriod: 4000, frequency: "biweekly",
        fedRate: 0.18, stateRate: 0.05, noStateTax: false,
        pretax401kPct: 0.06, hsaMonthly: 0, healthPremiumMonthly: 0,
        annualRaisePct: 0.03, raiseMonth: 1,
      };
    case "se1099":
      return {
        id, type, name: "Side business", enabled: true,
        grossMonthly: 3000, fedEffectiveRate: 0.22, stateRate: 0.05, noStateTax: false,
        businessExpensePct: 0.1,
      };
    case "dividend":
      return {
        id, type, name: "Dividend portfolio", enabled: true,
        principal: 100000, annualYieldPct: 0.04, frequency: "quarterly",
        qualifiedPct: 1, growthPct: 0.05, drip: false,
        margin: { enabled: false, balance: 0, rate: 0.08, maintenanceRatio: 0.25, initialRatio: 0.5 },
      };
    case "hardmoney":
      return {
        id, type, name: "Hard money loan", enabled: true,
        principal: 50000, annualRate: 0.1, termMonths: 12,
        paymentStructure: "interest_only", returnOfPrincipalMonth: 12,
        defaultProbPct: 0.02, recoveryRatePct: 0.6, originationPct: 0.02, autoReinvest: false,
      };
    case "brokerage":
      return {
        id, type, name: "Brokerage account", enabled: true,
        startingPrincipal: 250000, expectedAnnualReturnPct: 0.07, annualVolatilityPct: 0.15,
        withdrawalMode: "fixed_dollar", withdrawalAmount: 1000, withdrawalPctOfStart: 0.04,
        taxTreatment: "taxable", costBasis: 200000,
      };
  }
}

export function AddSourceMenu() {
  const [open, setOpen] = React.useState(false);
  const addSource = useStore((s) => s.addSource);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" /> Add source
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add income source</DialogTitle>
            <DialogDescription>Pick a source type to add to this scenario.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => {
                  addSource(defaultSource(t.type));
                  setOpen(false);
                }}
                className="w-full rounded-md border p-3 text-left hover:bg-accent hover:text-accent-foreground min-h-[44px]"
              >
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

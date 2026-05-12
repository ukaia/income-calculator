import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { projectAll, aggregate } from "@/lib/calculations";
import { SummaryCards } from "./SummaryCards";
import { StackedNetIncome } from "@/components/charts/StackedNetIncome";
import { PrincipalTrajectory } from "@/components/charts/PrincipalTrajectory";
import { SourceMixPie } from "@/components/charts/SourceMixPie";
import { SourceRangeBars } from "./SourceRangeBars";
import { MarginCallCard } from "./MarginCallCard";
import { GoalCard } from "./GoalCard";
import { SensitivityPanel } from "./SensitivityPanel";
import { StressTestCard } from "./StressTestCard";
import type { Source } from "@/lib/schema";

function useIsMobile() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setM(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return m;
}

export function Dashboard() {
  const active = useStore((s) => s.getActive());
  const sensitivity = useStore((s) => s.sensitivity);
  const isMobile = useIsMobile();

  // Apply sensitivity transient overrides to source list and settings
  const sources: Source[] = React.useMemo(() => {
    return active.sources.map((s) => {
      if (s.type === "dividend") {
        return {
          ...s,
          annualYieldPct: Math.max(0, s.annualYieldPct + sensitivity.dividendYieldDelta),
          margin: { ...s.margin, rate: Math.max(0, s.margin.rate + sensitivity.marginRateDelta) },
        };
      }
      if (s.type === "brokerage") {
        return {
          ...s,
          expectedAnnualReturnPct: s.expectedAnnualReturnPct + sensitivity.marketReturnDelta,
        };
      }
      return s;
    });
  }, [active.sources, sensitivity]);

  const settings = React.useMemo(
    () => ({ ...active.settings, inflationPct: Math.max(0, active.settings.inflationPct + sensitivity.inflationDelta) }),
    [active.settings, sensitivity],
  );

  const data = React.useMemo(() => aggregate(projectAll(sources, settings)), [sources, settings]);

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          {active.sources.filter((s) => s.enabled).length} active source{active.sources.filter((s) => s.enabled).length === 1 ? "" : "s"}
          {settings.viewRealDollars ? " · real $ view" : " · nominal $ view"}
        </p>
      </div>

      <SummaryCards
        data={data}
        monthlyExpenses={settings.monthlyExpenses}
        showReal={settings.viewRealDollars}
        inflationPct={settings.inflationPct}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly net income by source</CardTitle>
          </CardHeader>
          <CardContent>
            <StackedNetIncome data={data} isMobile={isMobile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current month mix</CardTitle>
          </CardHeader>
          <CardContent>
            <SourceMixPie data={data} isMobile={isMobile} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total principal trajectory</CardTitle>
        </CardHeader>
        <CardContent>
          <PrincipalTrajectory
            data={data}
            isMobile={isMobile}
            showReal={settings.viewRealDollars}
            inflationPct={settings.inflationPct}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SourceRangeBars data={data} />
        <MarginCallCard data={data} />
        <GoalCard data={data} goal={settings.goalMonthlyNetIncome} />
        <StressTestCard sources={sources} settings={settings} />
      </div>

      <SensitivityPanel />
    </div>
  );
}

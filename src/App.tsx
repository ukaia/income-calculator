import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { SourcesList } from "@/components/sources/SourcesList";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { ScenariosView } from "@/components/scenarios/ScenariosView";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Shortcuts, useShortcuts } from "@/components/Shortcuts";
import { Button } from "@/components/ui/button";
import { exportSchema } from "@/lib/schema";
import { LayoutDashboard, ListPlus, Layers, Settings as SettingsIcon, Download, Upload, Sun, Moon, HelpCircle } from "lucide-react";

const TABS = [
  { value: "sources", label: "Sources", Icon: ListPlus },
  { value: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { value: "scenarios", label: "Scenarios", Icon: Layers },
  { value: "settings", label: "Settings", Icon: SettingsIcon },
];

export default function App() {
  const active = useStore((s) => s.getActive());
  const updateActiveSettings = useStore((s) => s.updateActiveSettings);
  const replaceAll = useStore((s) => s.replaceAll);
  const [tab, setTab] = React.useState("dashboard");
  const [help, setHelp] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Apply dark mode
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", active.settings.darkMode);
  }, [active.settings.darkMode]);

  // Register SW (skip on file://)
  React.useEffect(() => {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }, []);

  const onExport = React.useCallback(() => {
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
  }, []);

  const onImport = React.useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = exportSchema.parse(JSON.parse(String(reader.result)));
        replaceAll({ scenarios: parsed.scenarios, activeScenarioId: parsed.activeScenarioId });
      } catch (e) {
        alert(`Import failed: ${(e as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  useShortcuts({
    onExport,
    onImport,
    onTab: (n) => setTab(TABS[n]?.value ?? tab),
    onHelp: () => setHelp((v) => !v),
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b safe-top">
          <div className="container flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-md bg-primary/15 flex items-center justify-center text-primary">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">Income & Principal Tracker</div>
                <div className="text-[11px] text-muted-foreground truncate">{active.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 no-print">
              <Button variant="ghost" size="icon" aria-label="Help" onClick={() => setHelp(true)}>
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Toggle dark mode" onClick={() => updateActiveSettings({ darkMode: !active.settings.darkMode })}>
                {active.settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" aria-label="Export" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Import" onClick={onImport}>
                <Upload className="h-4 w-4" />
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImportFile(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="container hidden md:flex no-print">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    <t.Icon className="h-4 w-4 mr-2" />
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </header>

        <main className="container py-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsContent value="sources"><SourcesList /></TabsContent>
            <TabsContent value="dashboard"><Dashboard /></TabsContent>
            <TabsContent value="scenarios"><ScenariosView /></TabsContent>
            <TabsContent value="settings"><SettingsPanel /></TabsContent>
          </Tabs>
        </main>

        {/* Bottom tab bar on mobile */}
        <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-card md:hidden safe-bottom no-print">
          <div className="grid grid-cols-4">
            {TABS.map((t) => {
              const active = tab === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] text-xs ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                  aria-label={t.label}
                >
                  <t.Icon className="h-5 w-5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <footer className="container py-6 text-center text-xs text-muted-foreground no-print">
          Estimates only. Not financial, investment, or tax advice. Verify with a licensed professional.
        </footer>

        <Shortcuts open={help} onOpenChange={setHelp} />
      </div>
    </TooltipProvider>
  );
}

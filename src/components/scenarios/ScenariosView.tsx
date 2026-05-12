import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";
import { Copy, Trash2, Pencil, Check } from "lucide-react";
import { ScenarioCompare } from "./ScenarioCompare";

export function ScenariosView() {
  const scenarios = useStore((s) => s.scenarios);
  const activeId = useStore((s) => s.activeScenarioId);
  const setActive = useStore((s) => s.setActive);
  const rename = useStore((s) => s.renameScenario);
  const duplicate = useStore((s) => s.duplicateScenario);
  const remove = useStore((s) => s.deleteScenario);
  const create = useStore((s) => s.createScenario);

  const [editId, setEditId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Scenarios</h2>
          <p className="text-sm text-muted-foreground">Save and compare what-ifs.</p>
        </div>
        <Button onClick={() => create("New scenario")}>New scenario</Button>
      </div>

      <div className="space-y-2">
        {scenarios.map((s) => {
          const editing = editId === s.id;
          return (
            <Card key={s.id} className={s.id === activeId ? "ring-2 ring-primary" : undefined}>
              <CardContent className="flex items-center justify-between gap-2 py-3 sm:py-4">
                {editing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                    <Button
                      size="icon"
                      onClick={() => {
                        rename(s.id, editName || s.name);
                        setEditId(null);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    className="flex-1 text-left min-h-[44px]"
                    onClick={() => setActive(s.id)}
                    aria-label={`Activate ${s.name}`}
                  >
                    <div className="font-medium text-sm">
                      {s.name} {s.id === activeId && <span className="ml-2 text-xs text-primary">(active)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.sources.length} source{s.sources.length === 1 ? "" : "s"}
                    </div>
                  </button>
                )}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditId(s.id); setEditName(s.name); }} aria-label="Rename">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => duplicate(s.id)} aria-label="Duplicate">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Delete" disabled={scenarios.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compare</CardTitle>
          <CardDescription>Select up to 3 scenarios to overlay.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScenarioCompare />
        </CardContent>
      </Card>
    </div>
  );
}

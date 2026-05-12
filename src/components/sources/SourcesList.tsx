import { useStore } from "@/store/useStore";
import { SourceCard } from "./SourceCard";
import { AddSourceMenu } from "./AddSourceMenu";
import { Card, CardContent } from "@/components/ui/card";

export function SourcesList() {
  const active = useStore((s) => s.getActive());
  const sources = active.sources;

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Income sources</h2>
          <p className="text-sm text-muted-foreground">{sources.length} source{sources.length === 1 ? "" : "s"}</p>
        </div>
        <AddSourceMenu />
      </div>

      {sources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No sources yet. Add one to start projecting income.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sources.map((src) => (
            <SourceCard key={src.id} source={src} />
          ))}
        </div>
      )}
    </div>
  );
}

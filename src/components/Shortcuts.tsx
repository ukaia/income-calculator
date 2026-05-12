import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const SHORTCUTS = [
  { keys: "?", action: "Show this cheat sheet" },
  { keys: "Cmd/Ctrl + S", action: "Export JSON" },
  { keys: "Cmd/Ctrl + E", action: "Open import dialog" },
  { keys: "1 – 4", action: "Switch tabs" },
];

export function Shortcuts({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Press ? again to close.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between border-b py-2">
              <span className="text-sm">{s.action}</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">{s.keys}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useShortcuts(opts: {
  onExport: () => void;
  onImport: () => void;
  onTab: (n: number) => void;
  onHelp: () => void;
}) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        opts.onExport();
      } else if (meta && e.key.toLowerCase() === "e") {
        e.preventDefault();
        opts.onImport();
      } else if (!meta && e.key === "?") {
        opts.onHelp();
      } else if (!meta && /^[1-4]$/.test(e.key)) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
        opts.onTab(parseInt(e.key, 10) - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [opts]);
}

import * as React from "react";
import { Label } from "./label";
import { HelpTip } from "./tooltip";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor?: string;
  help?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, help, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor} className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        {help && <HelpTip>{help}</HelpTip>}
      </div>
      {children}
    </div>
  );
}

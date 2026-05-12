import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 max-w-[260px] overflow-hidden rounded-md border bg-card px-3 py-2 text-xs text-card-foreground shadow-md",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

interface HelpTipProps {
  children: React.ReactNode;
  className?: string;
}

// Tap-friendly help tooltip. Acts as both hover (desktop) and tap-to-toggle (mobile).
export function HelpTip({ children, className }: HelpTipProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <TooltipRoot open={open} onOpenChange={setOpen} delayDuration={200}>
      <TooltipTrigger
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        aria-label="Show help"
        className={cn(
          "inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground",
          className,
        )}
      >
        <Info className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </TooltipRoot>
  );
}

export { TooltipProvider, TooltipRoot as Tooltip, TooltipTrigger, TooltipContent };

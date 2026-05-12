import * as React from "react";
import { Input } from "./input";
import { parseNumeric } from "@/lib/formatters";

interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  decimals?: number;
}

export function MoneyInput({
  value,
  onChange,
  prefix = "$",
  suffix,
  className,
  ...rest
}: NumericInputProps) {
  const [text, setText] = React.useState<string>(() => formatDisplay(value));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setText(formatDisplay(value));
  }, [value, focused]);

  return (
    <div className="relative">
      {prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        inputMode="decimal"
        type="text"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setText(formatDisplay(value));
        }}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseNumeric(e.target.value));
        }}
        className={`${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""} ${className ?? ""}`}
        {...rest}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

function formatDisplay(n: number): string {
  if (!isFinite(n) || n === 0) return "";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(n);
}

interface PercentInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number; // 0..1 fraction
  onChange: (n: number) => void;
  decimals?: number;
}

export function PercentInput({ value, onChange, decimals = 2, className, ...rest }: PercentInputProps) {
  const [text, setText] = React.useState(() => formatPctDisplay(value, decimals));
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setText(formatPctDisplay(value, decimals));
  }, [value, decimals, focused]);

  return (
    <div className="relative">
      <Input
        inputMode="decimal"
        type="text"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setText(formatPctDisplay(value, decimals));
        }}
        onChange={(e) => {
          setText(e.target.value);
          const pct = parseNumeric(e.target.value);
          onChange(pct / 100);
        }}
        className={`pr-9 ${className ?? ""}`}
        {...rest}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        %
      </span>
    </div>
  );
}

function formatPctDisplay(fraction: number, decimals: number): string {
  if (!isFinite(fraction)) return "";
  return (fraction * 100).toFixed(decimals).replace(/\.?0+$/, "");
}

interface IntInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}

export function IntInput({ value, onChange, suffix, className, ...rest }: IntInputProps) {
  return (
    <div className="relative">
      <Input
        inputMode="numeric"
        type="text"
        value={Number.isFinite(value) ? String(value) : ""}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/[^0-9-]/g, ""), 10);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className={`${suffix ? "pr-12" : ""} ${className ?? ""}`}
        {...rest}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

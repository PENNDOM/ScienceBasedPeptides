import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-[var(--radius)] border bg-surface px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            error ? "border-danger" : "border-[var(--border)]",
            className
          )}
          {...props}
        />
        {hint && !error ? <p className="text-xs text-[var(--text-muted)]">{hint}</p> : null}
        {error ? <p className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

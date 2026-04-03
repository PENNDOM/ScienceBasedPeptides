import { cn } from "@/lib/utils";
import { RESEARCH_USE_DISCLAIMER } from "@/lib/compliance";

export function Disclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-[var(--accent)]/40 bg-[var(--accent-muted)] p-4 text-sm leading-relaxed text-[var(--text)]",
        className
      )}
      role="note"
    >
      <p>{RESEARCH_USE_DISCLAIMER}</p>
    </div>
  );
}

export function FooterDisclaimer({ className }: { className?: string }) {
  return <p className={cn("text-xs text-[var(--text-muted)]", className)}>{RESEARCH_USE_DISCLAIMER}</p>;
}

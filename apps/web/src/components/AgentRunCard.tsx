import { cn } from "@rakazo/ui-web";
import { Check, Minus, Sparkle, X } from "lucide-react";
import type { ReactNode } from "react";

export type AgentRunTone = "running" | "success" | "failed" | "cancelled";

export function oneLineSummary(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function StatusControl({ tone, label }: { tone: AgentRunTone; label: string }) {
  if (tone === "running") {
    return (
      <span
        role="status"
        aria-label={label}
        className="relative grid size-5 shrink-0 place-items-center"
      >
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-[1.5px] border-muted-foreground/25 border-t-foreground motion-reduce:animate-none"
        />
      </span>
    );
  }
  if (tone === "success") {
    return (
      <span
        role="status"
        aria-label={label}
        className="grid size-5 shrink-0 place-items-center rounded-full bg-success text-background"
      >
        <Check aria-hidden className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (tone === "cancelled") {
    return (
      <span
        role="status"
        aria-label={label}
        className="grid size-5 shrink-0 place-items-center rounded-full bg-warning/20 text-warning"
      >
        <Minus aria-hidden className="size-3" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span
      role="status"
      aria-label={label}
      className="grid size-5 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground"
    >
      <X aria-hidden className="size-3" strokeWidth={3} />
    </span>
  );
}

export function AgentRunCard({
  title,
  summary,
  footer,
  tone,
  status,
  statusLabel,
  href,
  testId,
}: {
  title: string;
  summary?: string;
  footer?: ReactNode;
  tone: AgentRunTone;
  status: string;
  statusLabel: string;
  href?: string;
  testId: string;
}) {
  const summaryText = oneLineSummary(summary);
  const card = (
    <div
      data-slot="card"
      data-testid={testId}
      data-status={status}
      className={cn(
        "flex w-[380px] max-w-full items-center gap-2.5 overflow-hidden rounded-xl bg-card px-3 py-2.5 text-card-foreground shadow-sm ring-1 ring-foreground/10",
        href && "transition-colors group-hover:bg-accent/50",
      )}
    >
      <span
        aria-hidden
        className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground ring-1 ring-foreground/10"
      >
        <Sparkle className="size-3.5" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] leading-snug font-semibold" dir="auto">
          {title}
        </div>
        {summaryText ? (
          <div
            className="mt-0.5 truncate text-[12.5px] leading-snug text-muted-foreground"
            dir="auto"
            title={summaryText}
          >
            {summaryText}
          </div>
        ) : null}
        {footer ? (
          <div className="mt-1.5 flex min-w-0 items-center text-[12px] leading-snug text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
      <StatusControl tone={tone} label={statusLabel} />
    </div>
  );

  if (!href) return card;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group block max-w-full text-inherit no-underline outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </a>
  );
}

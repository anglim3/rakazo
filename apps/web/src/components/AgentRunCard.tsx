import { cn } from "@rakazo/ui-web";
import { Check, Circle, LoaderCircle, X } from "lucide-react";
import type { ReactNode } from "react";

export type AgentRunTone = "running" | "success" | "failed" | "cancelled";

export function oneLineSummary(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function joinDetail(parts: Array<string | undefined>): string {
  return parts.map(oneLineSummary).filter(Boolean).join(" · ");
}

function StatusGlyph({ tone, label }: { tone: AgentRunTone; label: string }) {
  if (tone === "running") {
    return (
      <LoaderCircle
        role="status"
        aria-label={label}
        className="size-3.5 shrink-0 animate-spin text-foreground motion-reduce:animate-none"
        strokeWidth={2.2}
      />
    );
  }
  if (tone === "success") {
    return (
      <Check
        role="status"
        aria-label={label}
        className="size-3.5 shrink-0 text-success"
        strokeWidth={2.4}
      />
    );
  }
  if (tone === "cancelled") {
    return (
      <Circle
        role="status"
        aria-label={label}
        className="size-3.5 shrink-0 text-muted-foreground/70"
        strokeWidth={2}
      />
    );
  }
  return (
    <X
      role="status"
      aria-label={label}
      className="size-3.5 shrink-0 text-destructive"
      strokeWidth={2.4}
    />
  );
}

export function AgentRunCard({
  title,
  summary,
  tone,
  status,
  statusLabel,
  href,
  testId,
}: {
  title: string;
  summary?: string;
  tone: AgentRunTone;
  status: string;
  statusLabel: string;
  href?: string;
  testId: string;
}) {
  const summaryText = oneLineSummary(summary);
  const pending = tone === "cancelled";
  const card = (
    <div
      data-slot="card"
      data-testid={testId}
      data-status={status}
      className={cn(
        "flex w-[360px] max-w-full items-start gap-2.5 rounded-lg border border-border bg-card px-3 py-2 text-card-foreground",
        href && "transition-colors group-hover:bg-accent",
      )}
    >
      <span className="mt-0.5 grid size-4 shrink-0 place-items-center">
        <StatusGlyph tone={tone} label={statusLabel} />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate text-[13.5px] leading-snug font-semibold",
            pending ? "text-muted-foreground" : "text-foreground",
          )}
          dir="auto"
        >
          {title}
        </div>
        {summaryText ? (
          <div
            className="mt-0.5 truncate text-[12px] leading-snug text-muted-foreground"
            dir="auto"
            title={summaryText}
          >
            {summaryText}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (!href) return card;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group block max-w-full text-inherit no-underline outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </a>
  );
}

export function AgentRunStack({ children }: { children: ReactNode }) {
  return (
    <div
      data-testid="agent-run-stack"
      className="flex w-[360px] max-w-full flex-col gap-1.5 rounded-xl bg-muted p-1.5"
    >
      {children}
    </div>
  );
}

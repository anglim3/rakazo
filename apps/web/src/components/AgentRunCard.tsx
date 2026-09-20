import { cn } from "@rakazo/ui-web";
import { Check, ChevronDown, Circle, X } from "lucide-react";
import type { ReactNode } from "react";
import { Children } from "react";

export type AgentRunTone = "running" | "success" | "failed" | "cancelled";

const SPOKE_OPACITIES = [0.2, 0.3, 0.4, 0.5, 0.62, 0.75, 0.88, 1] as const;

export function oneLineSummary(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function joinDetail(parts: Array<string | undefined>): string {
  return parts.map(oneLineSummary).filter(Boolean).join(" · ");
}

function SpokeSpinner({ label }: { label: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className="relative size-3.5 shrink-0 motion-safe:animate-spin motion-reduce:animate-none"
    >
      {SPOKE_OPACITIES.map((opacity, index) => (
        <span
          key={opacity}
          className="absolute top-1/2 left-1/2 h-1.5 w-0.5 rounded-full bg-foreground"
          style={{
            opacity,
            transform: `translate(-50%, -50%) rotate(${index * 45}deg) translateY(-4.5px)`,
          }}
        />
      ))}
    </span>
  );
}

function StatusGlyph({ tone, label }: { tone: AgentRunTone; label: string }) {
  if (tone === "running") {
    return <SpokeSpinner label={label} />;
  }
  if (tone === "success") {
    return (
      <Check
        role="status"
        aria-label={label}
        className="size-3.5 shrink-0 text-foreground"
        strokeWidth={2}
      />
    );
  }
  if (tone === "cancelled") {
    return (
      <Circle
        role="status"
        aria-label={label}
        className="size-3.5 shrink-0 text-muted-foreground"
        strokeWidth={2}
      />
    );
  }
  return (
    <X
      role="status"
      aria-label={label}
      className="size-3.5 shrink-0 text-destructive"
      strokeWidth={2}
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
      className="flex w-[360px] max-w-full items-start gap-2.5 rounded-lg bg-background px-3 py-2 text-foreground"
    >
      <span className="mt-0.5 grid size-3.5 shrink-0 place-items-center">
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
        <div
          className="mt-0.5 min-h-4 truncate text-[12px] leading-snug text-muted-foreground"
          dir="auto"
          title={summaryText || undefined}
        >
          {summaryText || "\u00a0"}
        </div>
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

export function AgentRunStack({ children, heading }: { children: ReactNode; heading?: string }) {
  const items = Children.toArray(children);
  const stacked = items.length > 1;
  const label = stacked ? heading : undefined;

  return (
    <div
      data-testid="agent-run-stack"
      className={cn(
        "flex w-[360px] max-w-full flex-col rounded-xl bg-accent",
        stacked ? "gap-1.5 p-1.5" : "p-1",
      )}
    >
      {label ? (
        <div
          data-testid="agent-run-stack-heading"
          className="flex items-center gap-0.5 px-2 pt-0.5 pb-0.5 text-[12px] leading-none text-muted-foreground"
        >
          <span>{label}</span>
          <ChevronDown className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
        </div>
      ) : null}
      {items}
    </div>
  );
}

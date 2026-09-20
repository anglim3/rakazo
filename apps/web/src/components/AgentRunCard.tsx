import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@rakazo/ui-web";
import { Check, ChevronDown, Circle, X } from "lucide-react";
import type { ReactNode } from "react";
import { Children, useState } from "react";

export type AgentRunTone = "running" | "success" | "failed" | "cancelled";
export type AgentRunLink = { href: string; label: string };

export const AGENT_RUN_CARD_WIDTH_PX = 360;
export const AGENT_RUN_CARD_HEIGHT_PX = 52;

const SPOKE_OPACITIES = [0.2, 0.3, 0.4, 0.5, 0.62, 0.75, 0.88, 1] as const;

export function oneLineSummary(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function joinDetail(parts: Array<string | undefined>): string {
  return parts.map(oneLineSummary).filter(Boolean).join(" · ");
}

function uniqueLines(lines: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const text = line?.replace(/\s+/g, " ").trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }
  return result;
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

function AgentRunWorkDialog({
  open,
  onOpenChange,
  title,
  statusLabel,
  lines,
  links,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  statusLabel: string;
  lines: string[];
  links: AgentRunLink[];
}) {
  if (!open) return null;
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent data-testid="agent-run-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="pr-8" dir="auto">
            {title}
          </DialogTitle>
          <DialogDescription>{statusLabel}</DialogDescription>
        </DialogHeader>
        {lines.length > 0 ? (
          <div className="max-h-[min(70vh,24rem)] overflow-y-auto text-[14px] leading-relaxed wrap-anywhere whitespace-pre-wrap text-foreground">
            {lines.map((line) => (
              <p key={line} className="not-first:mt-3">
                {line}
              </p>
            ))}
          </div>
        ) : null}
        {links.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-foreground underline underline-offset-3"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function AgentRunCard({
  title,
  summary,
  tone,
  status,
  statusLabel,
  testId,
  lines,
  links,
}: {
  title: string;
  summary?: string;
  tone: AgentRunTone;
  status: string;
  statusLabel: string;
  testId: string;
  lines?: Array<string | undefined>;
  links?: AgentRunLink[];
}) {
  const [open, setOpen] = useState(false);
  const summaryText = oneLineSummary(summary);
  const pending = tone === "cancelled";
  const detailLines = uniqueLines(lines?.some(Boolean) ? lines : [summaryText]);
  const detailLinks = links ?? [];

  return (
    <>
      <button
        type="button"
        data-slot="card"
        data-testid={testId}
        data-status={status}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-[52px] w-[360px] max-w-full min-w-0 shrink-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg bg-background px-3 text-left text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="grid size-3.5 shrink-0 place-items-center">
          <StatusGlyph tone={tone} label={statusLabel} />
        </span>
        <span className="min-w-0 flex-1 overflow-hidden">
          <span
            className={cn(
              "block h-[18px] truncate text-[13.5px] leading-[18px] font-semibold",
              pending ? "text-muted-foreground" : "text-foreground",
            )}
            dir="auto"
          >
            {title}
          </span>
          <span
            className="mt-0.5 block h-4 truncate text-[12px] leading-4 text-muted-foreground"
            dir="auto"
            title={summaryText || undefined}
          >
            {summaryText || "\u00a0"}
          </span>
        </span>
      </button>
      <AgentRunWorkDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        statusLabel={statusLabel}
        lines={detailLines}
        links={detailLinks}
      />
    </>
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

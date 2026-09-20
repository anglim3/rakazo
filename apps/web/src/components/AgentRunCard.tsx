import {
  buttonVariants,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@rakazo/ui-web";
import { ArrowUpRight, ChevronDown, GitPullRequest, Globe, Triangle } from "lucide-react";
import type { ReactNode } from "react";
import { Children, useState } from "react";

export type AgentRunTone = "running" | "success" | "failed" | "cancelled";
export type AgentRunLink = { href: string; label: string };
export type AgentRunAction = { label: string; kind: "primary" | "secondary"; href?: string };
export type AgentRunSection = { title: string; body: string };
export type AgentRunFileStats = {
  filesChanged?: number;
  additions?: number;
  deletions?: number;
};

export const AGENT_RUN_CARD_WIDTH_PX = 512;

function hasFileStats(stats: AgentRunFileStats | undefined): boolean {
  return (
    stats != null &&
    (stats.filesChanged != null || stats.additions != null || stats.deletions != null)
  );
}

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

function pillClass(tone: AgentRunTone): string {
  if (tone === "failed") return "bg-destructive/15 text-destructive";
  if (tone === "cancelled") return "bg-muted text-muted-foreground";
  return "bg-success/15 text-success";
}

function StatusPill({ tone, label }: { tone: AgentRunTone; label: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        pillClass(tone),
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full bg-current",
          tone === "running" && "motion-safe:animate-pulse",
        )}
      />
      {label}
    </span>
  );
}

function AgentRunWorkDialog({
  open,
  onOpenChange,
  title,
  statusLabel,
  sections,
  lines,
  links,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  statusLabel: string;
  sections: AgentRunSection[];
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
        {sections.length > 0 ? (
          <div className="flex max-h-[min(70vh,24rem)] flex-col gap-4 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.title} className="min-w-0">
                <h3 className="text-[12px] font-medium text-muted-foreground">{section.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed wrap-anywhere whitespace-pre-wrap text-foreground">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        ) : lines.length > 0 ? (
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

function CardAction({
  action,
  onOpenDialog,
}: {
  action: AgentRunAction;
  onOpenDialog: () => void;
}) {
  if (!action.href) {
    return (
      <button
        type="button"
        data-testid="agent-run-open"
        aria-haspopup="dialog"
        onClick={onOpenDialog}
        className={cn(buttonVariants({ variant: "default", size: "default" }), "rounded-md")}
      >
        {action.label}
      </button>
    );
  }
  if (action.kind === "primary") {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          buttonVariants({ variant: "default", size: "default" }),
          "rounded-md no-underline",
        )}
      >
        {action.label}
        <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden="true" />
      </a>
    );
  }
  return (
    <a
      href={action.href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-8 items-stretch overflow-hidden rounded-md border border-foreground/20 bg-secondary text-sm font-medium text-foreground no-underline outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="inline-flex items-center gap-1.5 px-2.5">
        <Globe className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        {action.label}
      </span>
      <span className="w-px self-stretch bg-foreground/20" aria-hidden="true" />
      <span className="inline-flex w-7 items-center justify-center" aria-hidden="true">
        <Triangle className="size-2 rotate-180 fill-current" strokeWidth={0} />
      </span>
    </a>
  );
}

export function AgentRunCard({
  title,
  summary,
  tone,
  status,
  statusLabel,
  testId,
  prLine,
  fileStats,
  filesLabel,
  lines,
  sections,
  links,
  actions,
}: {
  title: string;
  summary?: string;
  tone: AgentRunTone;
  status: string;
  statusLabel: string;
  testId: string;
  prLine?: string;
  fileStats?: AgentRunFileStats;
  filesLabel?: string;
  lines?: Array<string | undefined>;
  sections?: AgentRunSection[];
  links?: AgentRunLink[];
  actions?: AgentRunAction[];
}) {
  const [open, setOpen] = useState(false);
  const summaryText = oneLineSummary(summary);
  const prText = oneLineSummary(prLine);
  const showFiles = hasFileStats(fileStats);
  const detailLines = uniqueLines(lines?.some(Boolean) ? lines : [prText, filesLabel, summaryText]);
  const detailSections = sections ?? [];
  const detailLinks = (links ?? []).filter((link) => Boolean(link.href));
  const cardActions = actions ?? [];

  return (
    <>
      <div
        data-slot="card"
        data-testid={testId}
        data-status={status}
        className="flex w-[512px] max-w-full min-w-0 flex-col gap-3.5 overflow-hidden rounded-2xl bg-secondary p-4 text-foreground"
      >
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex min-w-0 cursor-pointer flex-col gap-2 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex min-w-0 items-start justify-between gap-3">
            <span
              className="min-w-0 flex-1 truncate text-[15px] leading-5 font-semibold"
              dir="auto"
            >
              {title}
            </span>
            <StatusPill tone={tone} label={statusLabel} />
          </span>
          {prText || showFiles || (summaryText && !prText) ? (
            <span className="flex min-w-0 flex-col gap-1">
              {prText ? (
                <span className="flex min-w-0 items-center gap-1.5 text-[13px] leading-4 text-muted-foreground">
                  <GitPullRequest
                    className="size-3.5 shrink-0"
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate" dir="auto">
                    {prText}
                  </span>
                </span>
              ) : null}
              {showFiles ? (
                <span className="flex min-w-0 items-center gap-1.5 text-[13px] leading-4 text-muted-foreground">
                  <span aria-hidden="true" className="w-3.5 shrink-0 text-center text-[12px]">
                    ±
                  </span>
                  {filesLabel ? <span className="min-w-0 truncate">{filesLabel}</span> : null}
                  {fileStats?.additions != null ? (
                    <span className="shrink-0 text-success">{`+${fileStats.additions}`}</span>
                  ) : null}
                  {fileStats?.deletions != null ? (
                    <span className="shrink-0 text-destructive">{`-${fileStats.deletions}`}</span>
                  ) : null}
                </span>
              ) : null}
              {summaryText && !prText ? (
                <span
                  className="block h-4 truncate text-[13px] leading-4 text-muted-foreground"
                  dir="auto"
                  title={summaryText}
                >
                  {summaryText}
                </span>
              ) : null}
            </span>
          ) : null}
        </button>
        {cardActions.length > 0 ? (
          <div className="flex min-w-0 flex-wrap gap-2">
            {cardActions.map((action) => (
              <CardAction
                key={action.href ?? action.label}
                action={action}
                onOpenDialog={() => setOpen(true)}
              />
            ))}
          </div>
        ) : null}
      </div>
      <AgentRunWorkDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        statusLabel={statusLabel}
        sections={detailSections}
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
        "flex w-[512px] max-w-full flex-col",
        stacked && "gap-2 rounded-2xl bg-accent p-2",
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

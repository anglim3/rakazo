import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { MessageBlock } from "@rakazo/contracts";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  AGENT_RUN_CARD_WIDTH_PX,
  AgentRunCard,
  AgentRunStack,
  joinDetail,
  oneLineSummary,
} from "./AgentRunCard";
import { CloudAgentCard } from "./CloudAgentCard";
import { SubagentCard } from "./SubagentCard";

vi.mock("@lingui/react/macro", () => {
  const t = (parts: TemplateStringsArray, ...values: unknown[]) =>
    parts.reduce(
      (result, part, index) => result + part + (index < values.length ? String(values[index]) : ""),
      "",
    );
  return { useLingui: () => ({ t }) };
});

function render(ui: ReactNode) {
  const i18n = setupI18n({ locale: "en", messages: {} });
  i18n.load("en", {});
  i18n.activate("en");
  return renderToString(<I18nProvider i18n={i18n}>{ui}</I18nProvider>);
}

const LONG_PROGRESS =
  "Searching the thread renderer for the compact agent-status row, including Shell MessageView, the mobile thread, and the shared AgentRunCard shell so this progress text would grow the old slab.";

describe("oneLineSummary", () => {
  it("collapses whitespace and trims", () => {
    expect(oneLineSummary("  Searching\n\nthe repo  ")).toBe("Searching the repo");
  });

  it("returns empty for missing values", () => {
    expect(oneLineSummary(undefined)).toBe("");
  });
});

describe("joinDetail", () => {
  it("joins non-empty parts with a middle dot", () => {
    expect(joinDetail(["Searching files", "Explore"])).toBe("Searching files · Explore");
  });
});

describe("AgentRunCard", () => {
  it("renders the Cursor-style panel with title and status pill", () => {
    const html = render(
      <AgentRunCard
        testId="cloud-agent-card"
        title="Add a README"
        tone="running"
        status="running"
        statusLabel="Running"
      />,
    );

    expect(html).toContain('data-testid="cloud-agent-card"');
    expect(html).toContain('data-status="running"');
    expect(html).toContain("w-[512px]");
    expect(html).toContain("rounded-2xl");
    expect(html).toContain("bg-secondary");
    expect(html).toContain("p-4");
    expect(html).toContain("font-semibold");
    expect(html).toContain("Add a README");
    expect(html).toContain("Running");
    expect(html).toContain("bg-success/15");
    expect(html).toContain("truncate");
    expect(html).toContain("overflow-hidden");
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Running"');
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain("h-[52px]");
    expect(html).not.toContain("agent-run-dialog");
    expect(html).not.toContain("files changed");
    expect(html).not.toContain("<a ");
    expect(AGENT_RUN_CARD_WIDTH_PX).toBe(512);
  });

  it("shows PR meta and file stats only when provided", () => {
    const withStats = render(
      <AgentRunCard
        testId="cloud-agent-card"
        title="Sandbox MCP filesystem paths (#13)"
        tone="success"
        status="finished"
        statusLabel="Done"
        prLine="cursor/mcp-path-allowlist-3a30 PR #24"
        fileStats={{ filesChanged: 6, additions: 487, deletions: 6 }}
        filesLabel="6 files changed"
        actions={[
          { href: "https://github.com/example/demo/pull/24", label: "View PR", kind: "primary" },
          { href: "https://cursor.com/agents/abc", label: "Open in Web", kind: "secondary" },
        ]}
      />,
    );
    const withoutStats = render(
      <AgentRunCard
        testId="cloud-agent-card"
        title="Add a README"
        tone="running"
        status="running"
        statusLabel="Running"
      />,
    );

    expect(withStats).toContain("cursor/mcp-path-allowlist-3a30 PR #24");
    expect(withStats).toContain("6 files changed");
    expect(withStats).toContain("+487");
    expect(withStats).toContain("-6");
    expect(withStats).toContain("text-success");
    expect(withStats).toContain("text-destructive");
    expect(withStats).toContain("View PR");
    expect(withStats).toContain("Open in Web");
    expect(withStats).toContain("rounded-md");
    expect(withStats).toContain("border-foreground/20");
    expect(withStats).toContain("w-px");
    expect(withStats).toContain("fill-current");
    expect(withStats).not.toContain("bg-transparent");
    expect(withStats).toContain('href="https://github.com/example/demo/pull/24"');
    expect(withStats).toContain('href="https://cursor.com/agents/abc"');
    expect(withoutStats).not.toContain("files changed");
    expect(withoutStats).not.toContain("+0");
    expect(withoutStats).not.toContain("text-destructive");
    expect(withoutStats).not.toContain("View PR");
    expect(withoutStats).not.toContain("Open in Web");
    expect(withoutStats).not.toContain("agent-run-open");
  });

  it("renders in-app Open on local cards and keeps Open in Web off them", () => {
    const html = render(
      <AgentRunCard
        testId="subagent-card"
        title="Map the layout"
        summary="Searching"
        tone="running"
        status="running"
        statusLabel="Running"
        actions={[{ label: "Open", kind: "primary" }]}
      />,
    );

    expect(html).toContain('data-testid="subagent-card"');
    expect(html).toContain('data-testid="agent-run-open"');
    expect(html).toContain("Open");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain("Open in Web");
    expect(html).not.toContain("cursor.com");
    expect(html).not.toContain("View PR");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("agent-run-dialog");
    expect(html).not.toContain("Code changes");
  });

  it("does not grow when progress text is long", () => {
    const shortHtml = render(
      <AgentRunCard
        testId="subagent-card"
        title="Map the layout"
        summary="Searching"
        tone="running"
        status="running"
        statusLabel="Running"
      />,
    );
    const longHtml = render(
      <AgentRunCard
        testId="subagent-card"
        title="Map the layout"
        summary={LONG_PROGRESS}
        tone="running"
        status="running"
        statusLabel="Running"
        lines={[LONG_PROGRESS]}
      />,
    );
    expect(longHtml).toContain("truncate");
    expect(longHtml).toContain("overflow-hidden");
    expect(longHtml).toContain("h-4");
    expect(shortHtml).toContain("h-4");
    expect(longHtml).toContain(LONG_PROGRESS);
    expect(longHtml).not.toContain("h-[52px]");
  });

  it("uses success, destructive, and muted pills", () => {
    const success = render(
      <AgentRunCard
        testId="subagent-card"
        title="Explore"
        tone="success"
        status="completed"
        statusLabel="Done"
      />,
    );
    const failed = render(
      <AgentRunCard
        testId="subagent-card"
        title="Explore"
        tone="failed"
        status="failed"
        statusLabel="Failed"
      />,
    );
    const cancelled = render(
      <AgentRunCard
        testId="cloud-agent-card"
        title="Add a README"
        tone="cancelled"
        status="cancelled"
        statusLabel="Cancelled"
      />,
    );

    expect(success).toContain("bg-success/15");
    expect(failed).toContain("text-destructive");
    expect(cancelled).toContain("text-muted-foreground");
  });

  it("keeps dialog links out of the initial markup until opened", () => {
    const html = render(
      <AgentRunCard
        testId="cloud-agent-card"
        title="Add a README"
        tone="success"
        status="finished"
        statusLabel="Done"
        links={[{ href: "https://github.com/example/demo/pull/1", label: "View PR" }]}
      />,
    );

    expect(html).toContain('type="button"');
    expect(html).toContain("Done");
    expect(html).not.toContain("agent-run-dialog");
    expect(html).not.toContain('href="https://github.com/example/demo/pull/1"');
  });

  it("stacks cards in a quiet panel with a started heading", () => {
    const html = render(
      <AgentRunStack heading="Started 2 subagents">
        <AgentRunCard
          testId="subagent-card"
          title="Map the layout"
          summary="Searching · Explore"
          tone="running"
          status="running"
          statusLabel="Running"
        />
        <AgentRunCard
          testId="stack-pending"
          title="Queue a follow-up pass"
          summary="Pending · Review"
          tone="cancelled"
          status="cancelled"
          statusLabel="Cancelled"
        />
      </AgentRunStack>,
    );
    expect(html).toContain('data-testid="agent-run-stack"');
    expect(html).toContain("bg-accent");
    expect(html).toContain("Started 2 subagents");
    expect(html).toContain('data-testid="agent-run-stack-heading"');
  });

  it("omits the heading on a single-card stack", () => {
    const html = render(
      <AgentRunStack>
        <AgentRunCard
          testId="cloud-agent-card"
          title="Add a README"
          tone="running"
          status="running"
          statusLabel="Running"
        />
      </AgentRunStack>,
    );
    expect(html).not.toContain("agent-run-stack-heading");
    expect(html).not.toContain("Started");
  });
});

describe("CloudAgentCard", () => {
  it("omits View PR and PR meta when prUrl is missing", () => {
    const html = render(
      <CloudAgentCard
        block={{
          kind: "cloud_agent",
          agentId: "emu-running",
          title: "Add a README",
          status: "running",
          url: "https://cursor.com/agents/abc",
        }}
      />,
    );

    expect(html).toContain('data-testid="cloud-agent-card"');
    expect(html).toContain("Add a README");
    expect(html).toContain("Running");
    expect(html).toContain("Open in Web");
    expect(html).toContain('href="https://cursor.com/agents/abc"');
    expect(html).not.toContain("View PR");
    expect(html).not.toContain("PR #");
    expect(html).not.toContain("files changed");
    expect(html).not.toContain("lucide-git-pull-request");
  });

  it("shows View PR only when prUrl exists and skips a duplicate Open in Web", () => {
    const html = render(
      <CloudAgentCard
        block={{
          kind: "cloud_agent",
          agentId: "emu-pr",
          title: "Sandbox MCP filesystem paths (#13)",
          status: "finished",
          url: "https://github.com/example/demo/pull/24",
          prUrl: "https://github.com/example/demo/pull/24",
          branch: "cursor/mcp-path-allowlist-3a30",
        }}
      />,
    );

    expect(html).toContain("View PR");
    expect(html).toContain('href="https://github.com/example/demo/pull/24"');
    expect(html).toContain("PR #24");
    expect(html).not.toContain("Open in Web");
  });

  it("stays complete with title and status when no URLs exist", () => {
    const html = render(
      <CloudAgentCard
        block={{
          kind: "cloud_agent",
          agentId: "emu-local",
          title: "Investigate the logs",
          status: "running",
          url: "",
        }}
      />,
    );

    expect(html).toContain("Investigate the logs");
    expect(html).toContain("Running");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain("View PR");
    expect(html).not.toContain("Open in Web");
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("PR #");
    expect(html).not.toContain("lucide-git-pull-request");
  });
});

describe("SubagentCard", () => {
  it("has Open and no PR chrome on local work", () => {
    const block: Extract<MessageBlock, { kind: "subagent" }> = {
      kind: "subagent",
      agentId: "explore-1",
      name: "Explore",
      task: "Map the message card layout in Shell and mobile",
      status: "running",
      progress: "Searching the thread renderer",
    };
    const html = render(<SubagentCard block={block} />);

    expect(html).toContain('data-testid="subagent-card"');
    expect(html).toContain('data-testid="agent-run-open"');
    expect(html).toContain("Open");
    expect(html).toContain("Running");
    expect(html).not.toContain("View PR");
    expect(html).not.toContain("Open in Web");
    expect(html).not.toContain("PR #");
    expect(html).not.toContain("files changed");
    expect(html).not.toContain("lucide-git-pull-request");
    expect(html).not.toContain("<a ");
  });
});

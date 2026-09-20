import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentRunCard, AgentRunStack, joinDetail, oneLineSummary } from "./AgentRunCard";

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
  it("renders a compact stacked row with left status, title, and muted detail", () => {
    const html = renderToString(
      <AgentRunCard
        testId="cloud-agent-card"
        title="Add a README"
        summary="Creating a pull request"
        tone="running"
        status="running"
        statusLabel="running"
      />,
    );

    expect(html).toContain('data-testid="cloud-agent-card"');
    expect(html).toContain('data-status="running"');
    expect(html).toContain("w-[360px]");
    expect(html).toContain("rounded-lg");
    expect(html).toContain("bg-card");
    expect(html).toContain("font-semibold");
    expect(html).toContain("Add a README");
    expect(html).toContain("Creating a pull request");
    expect(html).toContain("truncate");
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="running"');
    expect(html).toContain("animate-spin");
    expect(html).not.toContain("<a ");
  });

  it("uses check, x, and muted pending glyphs", () => {
    const success = renderToString(
      <AgentRunCard
        testId="subagent-card"
        title="Explore"
        tone="success"
        status="completed"
        statusLabel="completed"
      />,
    );
    const failed = renderToString(
      <AgentRunCard
        testId="subagent-card"
        title="Explore"
        tone="failed"
        status="failed"
        statusLabel="failed"
      />,
    );
    const cancelled = renderToString(
      <AgentRunCard
        testId="cloud-agent-card"
        title="Add a README"
        tone="cancelled"
        status="cancelled"
        statusLabel="cancelled"
      />,
    );

    expect(success).toContain("text-success");
    expect(failed).toContain("text-destructive");
    expect(cancelled).toContain("text-muted-foreground");
    expect(cancelled).not.toContain("opacity-70");
    expect(success).not.toContain("animate-spin");
  });

  it("wraps the row in a link when a url exists", () => {
    const html = renderToString(
      <AgentRunCard
        testId="cloud-agent-card"
        title="Add a README"
        summary="Pull request"
        tone="success"
        status="finished"
        statusLabel="finished"
        href="https://github.com/example/demo/pull/1"
      />,
    );

    expect(html).toContain('href="https://github.com/example/demo/pull/1"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain("Pull request");
  });

  it("stacks rows in a quiet panel", () => {
    const html = renderToString(
      <AgentRunStack>
        <AgentRunCard
          testId="subagent-card"
          title="Map the layout"
          summary="Searching · Explore"
          tone="running"
          status="running"
          statusLabel="running"
        />
      </AgentRunStack>,
    );
    expect(html).toContain('data-testid="agent-run-stack"');
    expect(html).toContain("bg-muted");
  });
});

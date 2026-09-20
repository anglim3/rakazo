import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentRunCard, oneLineSummary } from "./AgentRunCard";

describe("oneLineSummary", () => {
  it("collapses whitespace and trims", () => {
    expect(oneLineSummary("  Searching\n\nthe repo  ")).toBe("Searching the repo");
  });

  it("returns empty for missing values", () => {
    expect(oneLineSummary(undefined)).toBe("");
  });
});

describe("AgentRunCard", () => {
  it("renders a compact elevated card with glyph, title, summary, and running status", () => {
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
    expect(html).toContain("w-[380px]");
    expect(html).toContain("shadow-sm");
    expect(html).toContain("rounded-full");
    expect(html).toContain("Add a README");
    expect(html).toContain("Creating a pull request");
    expect(html).toContain("truncate");
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="running"');
    expect(html).toContain("animate-spin");
    expect(html).not.toContain("<a ");
  });

  it("uses success, failed, and cancelled status marks", () => {
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

    expect(success).toContain("bg-success");
    expect(failed).toContain("bg-destructive");
    expect(cancelled).toContain("text-warning");
    expect(success).not.toContain("animate-spin");
  });

  it("wraps the card in a link when a url exists", () => {
    const html = renderToString(
      <AgentRunCard
        testId="cloud-agent-card"
        title="Add a README"
        tone="success"
        status="finished"
        statusLabel="finished"
        href="https://github.com/example/demo/pull/1"
        footer={<span>Pull request</span>}
      />,
    );

    expect(html).toContain('href="https://github.com/example/demo/pull/1"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain("Pull request");
  });
});

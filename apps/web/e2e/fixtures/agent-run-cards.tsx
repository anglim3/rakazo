import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { useLingui } from "@lingui/react/macro";
import type { MessageBlock } from "@rakazo/contracts";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AgentRunCard, AgentRunStack } from "../../src/components/AgentRunCard";
import { CloudAgentCard } from "../../src/components/CloudAgentCard";
import { SubagentCard } from "../../src/components/SubagentCard";
import "../../src/styles.css";

const params = new URLSearchParams(location.search);
const theme = params.get("theme") === "light" ? "light" : "dark";
document.documentElement.dataset.theme = theme;
document.documentElement.style.colorScheme = theme;

const i18n = setupI18n({ locale: "en", messages: {} });
i18n.load("en", {});
i18n.activate("en");

const LONG_PROGRESS =
  "Searching the thread renderer for the compact agent-status row, including Shell MessageView, the mobile thread, and the shared AgentRunCard shell so the muted secondary line stays one truncated row even while this progress text keeps growing.";

const cloudRunning: Extract<MessageBlock, { kind: "cloud_agent" }> = {
  kind: "cloud_agent",
  agentId: "emu-running",
  title: "Add a README",
  status: "running",
  url: "https://cursor.com/agents/abc",
};

const cloudFinished: Extract<MessageBlock, { kind: "cloud_agent" }> = {
  kind: "cloud_agent",
  agentId: "emu-finished",
  title: "Sandbox MCP filesystem paths (#13)",
  status: "finished",
  url: "https://cursor.com/agents/abc",
  branch: "cursor/mcp-path-allowlist-3a30",
  prUrl: "https://github.com/example/demo/pull/24",
  filesChanged: 6,
  additions: 487,
  deletions: 6,
};

const subagentRunning: Extract<MessageBlock, { kind: "subagent" }> = {
  kind: "subagent",
  agentId: "explore-1",
  name: "Explore",
  task: "Map the message card layout in Shell and mobile",
  status: "running",
  progress: LONG_PROGRESS,
};

const subagentCompleted: Extract<MessageBlock, { kind: "subagent" }> = {
  kind: "subagent",
  agentId: "explore-1",
  name: "Explore",
  task: "Map the message card layout in Shell and mobile",
  status: "completed",
  result: "Cards should stay compact with a status mark.",
};

function Shot({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div data-testid={id} className="w-fit max-w-full p-3">
      {children}
    </div>
  );
}

function Case({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h2 className="px-3 text-[12px] font-medium text-muted-foreground">{label}</h2>
      <Shot id={id}>{children}</Shot>
    </section>
  );
}

function Gallery() {
  const { t } = useLingui();
  const stackCount = 4;
  return (
    <>
      <Case id="shot-subagent-running" label="Local subagent · running">
        <SubagentCard block={subagentRunning} />
      </Case>
      <Case id="shot-subagent-completed" label="Local subagent · completed">
        <SubagentCard block={subagentCompleted} />
      </Case>
      <Case id="shot-cloud-finished" label="Cloud agent · with PR">
        <CloudAgentCard block={cloudFinished} />
      </Case>
      <Case id="shot-cloud-running" label="Cloud agent · no PR">
        <CloudAgentCard block={cloudRunning} />
      </Case>
      <Case id="shot-stack" label="Stacked local subagents">
        <AgentRunStack heading={t`Started ${stackCount} subagents`}>
          <AgentRunCard
            testId="stack-running-a"
            title="Map the message card layout"
            summary="Searching files · Explore"
            tone="running"
            status="running"
            statusLabel="Running"
            actions={[{ label: t`Open`, kind: "primary" }]}
          />
          <AgentRunCard
            testId="stack-running-b"
            title="Draft the pull request body"
            summary="Writing summary · Writer"
            tone="running"
            status="running"
            statusLabel="Running"
            actions={[{ label: t`Open`, kind: "primary" }]}
          />
          <AgentRunCard
            testId="stack-running-c"
            title="Check locale catalogs"
            summary="Reading strings · Review"
            tone="running"
            status="running"
            statusLabel="Running"
            actions={[{ label: t`Open`, kind: "primary" }]}
          />
          <AgentRunCard
            testId="stack-pending"
            title="Queue a follow-up pass"
            summary="Pending · Review"
            tone="cancelled"
            status="cancelled"
            statusLabel="Cancelled"
            actions={[{ label: t`Open`, kind: "primary" }]}
          />
        </AgentRunStack>
      </Case>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <I18nProvider i18n={i18n}>
    <main className="flex min-h-screen flex-col gap-6 bg-background p-8 text-foreground">
      <Gallery />
    </main>
  </I18nProvider>,
);

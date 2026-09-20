import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { MessageBlock } from "@rakazo/contracts";
import { Badge } from "@rakazo/ui-web/components/ui/badge";
import { Card, CardContent } from "@rakazo/ui-web/components/ui/card";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { AgentRunCard, AgentRunStack } from "../../src/components/AgentRunCard";
import { CloudAgentCard } from "../../src/components/CloudAgentCard";
import { SubagentCard } from "../../src/components/SubagentCard";
import "../../src/styles.css";

const params = new URLSearchParams(location.search);
const theme = params.get("theme") === "light" ? "light" : "dark";
const gallery = params.get("gallery") === "legacy" ? "legacy" : "current";
document.documentElement.dataset.theme = theme;
document.documentElement.style.colorScheme = theme;

const i18n = setupI18n({ locale: "en", messages: {} });
i18n.load("en", {});
i18n.activate("en");

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
  title: "Add a README",
  status: "finished",
  url: "https://cursor.com/agents/abc",
  branch: "emulator/task",
  prUrl: "https://github.com/example/demo/pull/1",
};

const subagentRunning: Extract<MessageBlock, { kind: "subagent" }> = {
  kind: "subagent",
  agentId: "explore-1",
  name: "Explore",
  task: "Map the message card layout in Shell and mobile",
  status: "running",
  progress: "Searching the thread renderer",
};

const subagentCompleted: Extract<MessageBlock, { kind: "subagent" }> = {
  kind: "subagent",
  agentId: "explore-1",
  name: "Explore",
  task: "Map the message card layout in Shell and mobile",
  status: "completed",
  result: "Cards should stay compact with a status mark.",
};

function LegacyCloudAgentCard({
  block,
}: {
  block: Extract<MessageBlock, { kind: "cloud_agent" }>;
}) {
  const content = (
    <Card size="sm" className="w-80 max-w-full" data-testid="legacy-cloud-agent-card">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <span className="font-medium" dir="auto">
            {block.title}
          </span>
          <Badge
            variant="secondary"
            className={
              block.status === "failed"
                ? "text-destructive"
                : block.status === "finished"
                  ? "text-success"
                  : "text-muted-foreground"
            }
          >
            {block.status}
          </Badge>
        </div>
        {block.prUrl ? (
          <span className="text-muted-foreground">Pull request</span>
        ) : block.branch ? (
          <span className="text-muted-foreground" dir="auto">
            {block.branch}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
  return block.prUrl ? (
    <a href={block.prUrl} className="block max-w-full no-underline">
      {content}
    </a>
  ) : (
    content
  );
}

function LegacySubagentCard({ block }: { block: Extract<MessageBlock, { kind: "subagent" }> }) {
  const running = block.status === "running";
  const failed = block.status === "failed";
  return (
    <div
      data-testid="legacy-subagent-card"
      className="w-[min(420px,90%)] rounded-[18px] border border-border bg-muted px-[18px] py-4"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-medium text-foreground" dir="auto">
          {block.name}
        </span>
        <span
          className={`rounded-full px-[11px] py-1 text-[13px] ${
            failed
              ? "bg-destructive/15 text-destructive"
              : running
                ? "bg-warning/15 text-warning"
                : "bg-success/15 text-success"
          }`}
        >
          {running ? "subagent" : block.status}
        </span>
      </div>
      <div className="mt-2 text-[13.5px] text-muted-foreground">{block.task}</div>
      {block.progress || block.result ? (
        <div className="mt-2.5 text-[14.5px] leading-[1.5] text-foreground/75">
          {block.result || block.progress}
        </div>
      ) : null}
    </div>
  );
}

function Shot({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div data-testid={id} className="w-fit max-w-full p-3">
      {children}
    </div>
  );
}

const currentGallery = (
  <>
    <Shot id="shot-cloud-running">
      <CloudAgentCard block={cloudRunning} />
    </Shot>
    <Shot id="shot-cloud-finished">
      <CloudAgentCard block={cloudFinished} />
    </Shot>
    <Shot id="shot-subagent-running">
      <SubagentCard block={subagentRunning} />
    </Shot>
    <Shot id="shot-subagent-completed">
      <SubagentCard block={subagentCompleted} />
    </Shot>
    <Shot id="shot-stack">
      <AgentRunStack>
        <AgentRunCard
          testId="stack-running-a"
          title="Map the message card layout"
          summary="Searching files · Explore"
          tone="running"
          status="running"
          statusLabel="running"
        />
        <AgentRunCard
          testId="stack-running-b"
          title="Draft the pull request body"
          summary="Writing summary · Writer"
          tone="running"
          status="running"
          statusLabel="running"
        />
        <AgentRunCard
          testId="stack-running-c"
          title="Check locale catalogs"
          summary="Reading strings · Review"
          tone="running"
          status="running"
          statusLabel="running"
        />
        <AgentRunCard
          testId="stack-pending"
          title="Queue a follow-up pass"
          summary="Pending · Review"
          tone="cancelled"
          status="cancelled"
          statusLabel="cancelled"
        />
      </AgentRunStack>
    </Shot>
  </>
);

const legacyGallery = (
  <>
    <Shot id="shot-cloud-running">
      <LegacyCloudAgentCard block={cloudRunning} />
    </Shot>
    <Shot id="shot-cloud-finished">
      <LegacyCloudAgentCard block={cloudFinished} />
    </Shot>
    <Shot id="shot-subagent-running">
      <LegacySubagentCard block={subagentRunning} />
    </Shot>
    <Shot id="shot-subagent-completed">
      <LegacySubagentCard block={subagentCompleted} />
    </Shot>
  </>
);

createRoot(document.getElementById("root")!).render(
  <I18nProvider i18n={i18n}>
    <main className="flex min-h-screen flex-col gap-6 bg-background p-8 text-foreground">
      {gallery === "legacy" ? legacyGallery : currentGallery}
    </main>
  </I18nProvider>,
);

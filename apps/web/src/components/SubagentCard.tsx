import { useLingui } from "@lingui/react/macro";
import type { MessageBlock } from "@rakazo/contracts";
import type { AgentRunTone } from "./AgentRunCard";
import { AgentRunCard, oneLineSummary } from "./AgentRunCard";

function subagentTone(status: Extract<MessageBlock, { kind: "subagent" }>["status"]): AgentRunTone {
  if (status === "running") return "running";
  if (status === "completed") return "success";
  return "failed";
}

export function SubagentCard({ block }: { block: Extract<MessageBlock, { kind: "subagent" }> }) {
  const { t } = useLingui();
  const statusLabel =
    block.status === "running"
      ? t`running`
      : block.status === "completed"
        ? t`completed`
        : t`failed`;
  const summary =
    block.status === "running"
      ? oneLineSummary(block.progress) || block.task
      : oneLineSummary(block.result) || oneLineSummary(block.progress) || block.task;

  return (
    <AgentRunCard
      testId="subagent-card"
      title={block.name}
      summary={summary}
      tone={subagentTone(block.status)}
      status={block.status}
      statusLabel={statusLabel}
    />
  );
}

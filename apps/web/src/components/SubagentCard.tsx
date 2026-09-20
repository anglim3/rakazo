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
    block.status === "running" ? t`Running` : block.status === "completed" ? t`Done` : t`Failed`;
  const title = oneLineSummary(block.task) || block.name;
  const summary =
    block.status === "running" ? oneLineSummary(block.progress) : oneLineSummary(block.result);

  return (
    <AgentRunCard
      testId="subagent-card"
      title={title}
      summary={summary}
      tone={subagentTone(block.status)}
      status={block.status}
      statusLabel={statusLabel}
      lines={[block.task !== title ? block.task : undefined, block.progress, block.result]}
    />
  );
}

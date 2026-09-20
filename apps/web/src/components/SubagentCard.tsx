import { useLingui } from "@lingui/react/macro";
import type { MessageBlock } from "@rakazo/contracts";
import type { AgentRunTone } from "./AgentRunCard";
import { AgentRunCard, AgentRunStack, joinDetail, oneLineSummary } from "./AgentRunCard";

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
  const title = oneLineSummary(block.task) || block.name;
  const summary =
    block.status === "running"
      ? joinDetail([block.progress, block.name !== title ? block.name : undefined])
      : joinDetail([block.result || block.progress, block.name !== title ? block.name : undefined]);

  return (
    <AgentRunStack>
      <AgentRunCard
        testId="subagent-card"
        title={title}
        summary={summary}
        tone={subagentTone(block.status)}
        status={block.status}
        statusLabel={statusLabel}
      />
    </AgentRunStack>
  );
}

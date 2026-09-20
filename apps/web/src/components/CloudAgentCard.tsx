import { useLingui } from "@lingui/react/macro";
import type { MessageBlock } from "@rakazo/contracts";
import { cloudAgentHttpsUrl } from "@rakazo/core";
import type { AgentRunTone } from "./AgentRunCard";
import { AgentRunCard, AgentRunStack } from "./AgentRunCard";

function cloudAgentTone(
  status: Extract<MessageBlock, { kind: "cloud_agent" }>["status"],
): AgentRunTone {
  if (status === "running") return "running";
  if (status === "finished") return "success";
  if (status === "cancelled") return "cancelled";
  return "failed";
}

export function CloudAgentCard({
  block,
}: {
  block: Extract<MessageBlock, { kind: "cloud_agent" }>;
}) {
  const { t } = useLingui();
  const prHref = cloudAgentHttpsUrl(block.prUrl);
  const href = prHref ?? cloudAgentHttpsUrl(block.url);
  const statusLabel =
    block.status === "running"
      ? t`running`
      : block.status === "finished"
        ? t`finished`
        : block.status === "cancelled"
          ? t`cancelled`
          : t`failed`;
  const summary = prHref ? t`Pull request` : block.branch;

  return (
    <AgentRunStack>
      <AgentRunCard
        testId="cloud-agent-card"
        title={block.title}
        summary={summary}
        tone={cloudAgentTone(block.status)}
        status={block.status}
        statusLabel={statusLabel}
        href={href}
      />
    </AgentRunStack>
  );
}

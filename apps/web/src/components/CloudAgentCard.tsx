import { Trans, useLingui } from "@lingui/react/macro";
import type { MessageBlock } from "@rakazo/contracts";
import { cloudAgentHttpsUrl } from "@rakazo/core";
import { GitBranch, GitPullRequest } from "lucide-react";
import type { AgentRunTone } from "./AgentRunCard";
import { AgentRunCard } from "./AgentRunCard";

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
  const footer = prHref ? (
    <span className="inline-flex min-w-0 items-center gap-1 truncate rounded-md bg-secondary px-1.5 py-0.5">
      <GitPullRequest aria-hidden className="size-3 shrink-0" strokeWidth={2} />
      <Trans>Pull request</Trans>
    </span>
  ) : block.branch ? (
    <span
      className="inline-flex min-w-0 items-center gap-1 truncate rounded-md bg-secondary px-1.5 py-0.5 font-mono"
      dir="auto"
    >
      <GitBranch aria-hidden className="size-3 shrink-0" strokeWidth={2} />
      {block.branch}
    </span>
  ) : null;

  return (
    <AgentRunCard
      testId="cloud-agent-card"
      title={block.title}
      tone={cloudAgentTone(block.status)}
      status={block.status}
      statusLabel={statusLabel}
      href={href}
      footer={footer}
    />
  );
}

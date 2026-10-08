import { useLingui } from "@lingui/react/macro";
import type { MessageBlock } from "@rakazo/contracts";
import { cloudAgentHttpsUrl, pullRequestNumberFromUrl } from "@rakazo/core";
import type { AgentRunAction, AgentRunFileStats, AgentRunTone } from "./AgentRunCard";
import { AgentRunCard, oneLineSummary } from "./AgentRunCard";

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
  const agentHref = cloudAgentHttpsUrl(block.url);
  const statusLabel =
    block.status === "running"
      ? t`Running`
      : block.status === "finished"
        ? t`Done`
        : block.status === "cancelled"
          ? t`Cancelled`
          : t`Failed`;
  const prNumber = pullRequestNumberFromUrl(prHref);
  const prLabel = prNumber != null ? t`PR #${prNumber}` : undefined;
  const prLine = [oneLineSummary(block.branch), prLabel].filter(Boolean).join(" ") || undefined;
  const filesChanged = block.filesChanged;
  const filesLabel = filesChanged != null ? t`${filesChanged} files changed` : undefined;
  const fileStats: AgentRunFileStats | undefined =
    filesChanged != null || block.additions != null || block.deletions != null
      ? {
          ...(filesChanged != null ? { filesChanged } : {}),
          ...(block.additions != null ? { additions: block.additions } : {}),
          ...(block.deletions != null ? { deletions: block.deletions } : {}),
        }
      : undefined;
  const actions: AgentRunAction[] = [];
  if (prHref) actions.push({ href: prHref, label: t`View PR`, kind: "primary" });
  if (agentHref && agentHref !== prHref) {
    actions.push({ href: agentHref, label: t`Open in Web`, kind: "secondary" });
  }

  return (
    <AgentRunCard
      testId="cloud-agent-card"
      title={block.title || t`Cloud agent`}
      tone={cloudAgentTone(block.status)}
      status={block.status}
      statusLabel={statusLabel}
      prLine={prLine}
      fileStats={fileStats}
      filesLabel={fileStats ? filesLabel : undefined}
      lines={[block.branch, prLabel, filesLabel]}
      links={actions.filter((action): action is AgentRunAction & { href: string } =>
        Boolean(action.href),
      )}
      actions={actions}
    />
  );
}

import type { MessageBlock } from "@rakazo/contracts";
import { cloudAgentHttpsUrl, pullRequestNumberFromUrl } from "@rakazo/core";
import * as Clipboard from "expo-clipboard";
import type { ReactNode } from "react";
import { Children, useState } from "react";
import type { PressableProps, ViewProps } from "react-native";
import { Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { resolveMobileAppearance } from "../lib/appearance";
import { useI18n } from "../lib/i18n";
import { presentMessageActionSheet } from "../lib/message-action-sheet";
import { useMobileTokens } from "../lib/native";
import { NativeSymbol } from "./native-symbol";

export type AgentRunTone = "running" | "success" | "failed" | "cancelled";
export type AgentRunStackKind = "subagent" | "agent";
export type AgentRunLink = { href: string; label: string };
export type AgentRunAction = { label: string; kind: "primary" | "secondary"; href?: string };
export type AgentRunSection = { title: string; body: string };
export type AgentRunFileStats = {
  filesChanged?: number;
  additions?: number;
  deletions?: number;
};

export const AGENT_RUN_CARD_WIDTH_PX = 512;

export function oneLineSummary(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function uniqueLines(lines: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const text = line?.replace(/\s+/g, " ").trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }
  return result;
}

function hasFileStats(stats: AgentRunFileStats | undefined): boolean {
  return (
    stats != null &&
    (stats.filesChanged != null || stats.additions != null || stats.deletions != null)
  );
}

function pillColors(tone: AgentRunTone, tokens: ReturnType<typeof useMobileTokens>) {
  if (tone === "failed") {
    return { backgroundColor: `${String(tokens.destructive)}26`, color: tokens.destructive };
  }
  if (tone === "cancelled") {
    return { backgroundColor: tokens.muted, color: tokens.mutedForeground };
  }
  return { backgroundColor: `${String(tokens.success)}26`, color: tokens.success };
}

export function AgentRunCard({
  title,
  summary,
  tone,
  status,
  statusLabel,
  testID,
  prLine,
  fileStats,
  filesLabel,
  lines,
  sections,
  links,
  actions,
  onLongPress,
  accessibilityActions,
  onAccessibilityAction,
}: {
  title: string;
  summary?: string;
  tone: AgentRunTone;
  status: string;
  statusLabel: string;
  testID: string;
  prLine?: string;
  fileStats?: AgentRunFileStats;
  filesLabel?: string;
  lines?: Array<string | undefined>;
  sections?: AgentRunSection[];
  links?: AgentRunLink[];
  actions?: AgentRunAction[];
  onLongPress?: PressableProps["onLongPress"];
  accessibilityActions?: ViewProps["accessibilityActions"];
  onAccessibilityAction?: ViewProps["onAccessibilityAction"];
}) {
  const tokens = useMobileTokens();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const summaryText = oneLineSummary(summary);
  const prText = oneLineSummary(prLine);
  const showFiles = hasFileStats(fileStats);
  const detailLines = uniqueLines(lines?.some(Boolean) ? lines : [prText, filesLabel, summaryText]);
  const detailSections = sections ?? [];
  const detailLinks = (links ?? []).filter((link) => Boolean(link.href));
  const cardActions = actions ?? [];
  const pill = pillColors(tone, tokens);
  const chrome = `${String(tokens.foreground)}33`;

  return (
    <>
      <View
        testID={testID}
        accessibilityValue={{ text: status }}
        style={{
          maxWidth: AGENT_RUN_CARD_WIDTH_PX,
          width: "100%",
          alignSelf: "flex-start",
          gap: 14,
          overflow: "hidden",
          borderRadius: 16,
          backgroundColor: tokens.secondary,
          padding: 16,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title}: ${statusLabel}`}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(true)}
          onLongPress={onLongPress}
          accessibilityActions={accessibilityActions}
          onAccessibilityAction={onAccessibilityAction}
          style={{ gap: 8 }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                color: tokens.foreground,
                fontSize: 15,
                fontWeight: "600",
                lineHeight: 20,
              }}
            >
              {title}
            </Text>
            <View
              accessibilityRole="text"
              accessibilityLabel={statusLabel}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                backgroundColor: pill.backgroundColor,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: pill.color,
                }}
              />
              <Text style={{ color: pill.color, fontSize: 12, fontWeight: "500" }}>
                {statusLabel}
              </Text>
            </View>
          </View>
          {prText || showFiles || (summaryText && !prText) ? (
            <View style={{ gap: 4 }}>
              {prText ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <NativeSymbol
                    ios="arrow.triangle.pull"
                    android="git-pull-request"
                    size={14}
                    color={tokens.mutedForeground}
                  />
                  <Text
                    numberOfLines={1}
                    style={{ flex: 1, color: tokens.mutedForeground, fontSize: 13, lineHeight: 16 }}
                  >
                    {prText}
                  </Text>
                </View>
              ) : null}
              {showFiles ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: tokens.mutedForeground, fontSize: 12, width: 14 }}>±</Text>
                  {filesLabel ? (
                    <Text
                      numberOfLines={1}
                      style={{ flexShrink: 1, color: tokens.mutedForeground, fontSize: 13 }}
                    >
                      {filesLabel}
                    </Text>
                  ) : null}
                  {fileStats?.additions != null ? (
                    <Text style={{ color: tokens.success, fontSize: 13 }}>
                      +{fileStats.additions}
                    </Text>
                  ) : null}
                  {fileStats?.deletions != null ? (
                    <Text style={{ color: tokens.destructive, fontSize: 13 }}>
                      -{fileStats.deletions}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {summaryText && !prText ? (
                <Text
                  numberOfLines={1}
                  style={{
                    color: tokens.mutedForeground,
                    fontSize: 13,
                    lineHeight: 16,
                    height: 16,
                  }}
                >
                  {summaryText}
                </Text>
              ) : null}
            </View>
          ) : null}
        </Pressable>
        {cardActions.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {cardActions.map((action) => {
              const href = action.href;
              if (!href) {
                return (
                  <Pressable
                    key={action.label}
                    testID="agent-run-open"
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    onPress={() => setOpen(true)}
                    style={{
                      borderRadius: 6,
                      backgroundColor: tokens.primary,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                    }}
                  >
                    <Text
                      style={{ color: tokens.primaryForeground, fontSize: 13, fontWeight: "500" }}
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                );
              }
              if (action.kind === "primary") {
                return (
                  <Pressable
                    key={href}
                    accessibilityRole="link"
                    accessibilityLabel={action.label}
                    onPress={() => Linking.openURL(href).catch(() => undefined)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      borderRadius: 6,
                      backgroundColor: tokens.primary,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                    }}
                  >
                    <Text
                      style={{ color: tokens.primaryForeground, fontSize: 13, fontWeight: "500" }}
                    >
                      {action.label}
                    </Text>
                    <NativeSymbol
                      ios="arrow.up.right"
                      android="open-outline"
                      size={14}
                      color={tokens.primaryForeground}
                    />
                  </Pressable>
                );
              }
              return (
                <View
                  key={href}
                  style={{
                    flexDirection: "row",
                    alignItems: "stretch",
                    overflow: "hidden",
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: chrome,
                    backgroundColor: tokens.secondary,
                  }}
                >
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={action.label}
                    onPress={() => Linking.openURL(href).catch(() => undefined)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                    }}
                  >
                    <NativeSymbol
                      ios="globe"
                      android="globe-outline"
                      size={14}
                      color={tokens.foreground}
                    />
                    <Text style={{ color: tokens.foreground, fontSize: 13, fontWeight: "500" }}>
                      {action.label}
                    </Text>
                  </Pressable>
                  <View style={{ width: 1, backgroundColor: chrome }} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("More")}
                    onPress={() =>
                      presentMessageActionSheet({
                        actions: [
                          {
                            text: action.label,
                            onPress: () => Linking.openURL(href).catch(() => undefined),
                          },
                          {
                            text: t("Copy link"),
                            onPress: () => Clipboard.setStringAsync(href).catch(() => undefined),
                          },
                        ],
                        cancel: t("Cancel"),
                        more: t("More"),
                        colorScheme: resolveMobileAppearance(),
                      })
                    }
                    style={{
                      width: 28,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <NativeSymbol
                      ios="chevron.down"
                      android="chevron-down"
                      size={12}
                      color={tokens.foreground}
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <View
          testID="agent-run-dialog"
          style={{
            flex: 1,
            backgroundColor: tokens.background,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <Text
              accessibilityRole="header"
              style={{
                flex: 1,
                color: tokens.foreground,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("Close")}
              onPress={() => setOpen(false)}
            >
              <NativeSymbol ios="xmark" android="close" size={18} color={tokens.mutedForeground} />
            </Pressable>
          </View>
          <Text style={{ color: tokens.mutedForeground, fontSize: 13, marginBottom: 16 }}>
            {statusLabel}
          </Text>
          <ScrollView style={{ flex: 1 }}>
            {detailSections.length > 0
              ? detailSections.map((section) => (
                  <View key={section.title} style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        color: tokens.mutedForeground,
                        fontSize: 12,
                        fontWeight: "500",
                        marginBottom: 4,
                      }}
                    >
                      {section.title}
                    </Text>
                    <Text style={{ color: tokens.foreground, fontSize: 15, lineHeight: 22 }}>
                      {section.body}
                    </Text>
                  </View>
                ))
              : detailLines.map((line) => (
                  <Text
                    key={line}
                    style={{
                      color: tokens.foreground,
                      fontSize: 15,
                      lineHeight: 22,
                      marginBottom: 12,
                    }}
                  >
                    {line}
                  </Text>
                ))}
            {detailLinks.map((link) => (
              <Pressable
                key={link.href}
                accessibilityRole="link"
                onPress={() => Linking.openURL(link.href).catch(() => undefined)}
                style={{ marginBottom: 12 }}
              >
                <Text
                  style={{
                    color: tokens.foreground,
                    fontSize: 15,
                    textDecorationLine: "underline",
                  }}
                >
                  {link.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

export function CloudAgentCard({
  block,
}: {
  block: Extract<MessageBlock, { kind: "cloud_agent" }>;
}) {
  const { t } = useI18n();
  const title = block.title || t("Cloud agent");
  const statusLabel =
    block.status === "running"
      ? t("Running")
      : block.status === "finished"
        ? t("Done")
        : block.status === "cancelled"
          ? t("Cancelled")
          : t("Failed");
  const tone: AgentRunTone =
    block.status === "running"
      ? "running"
      : block.status === "finished"
        ? "success"
        : block.status === "cancelled"
          ? "cancelled"
          : "failed";
  const prHref = cloudAgentHttpsUrl(block.prUrl);
  const agentHref = cloudAgentHttpsUrl(block.url);
  const prNumber = pullRequestNumberFromUrl(prHref);
  const prLabel = prNumber != null ? t("PR #{number}", { number: prNumber }) : undefined;
  const prLine = [oneLineSummary(block.branch), prLabel].filter(Boolean).join(" ") || undefined;
  const filesChanged = block.filesChanged;
  const filesLabel =
    filesChanged != null ? t("{count} files changed", { count: filesChanged }) : undefined;
  const fileStats: AgentRunFileStats | undefined =
    filesChanged != null || block.additions != null || block.deletions != null
      ? {
          ...(filesChanged != null ? { filesChanged } : {}),
          ...(block.additions != null ? { additions: block.additions } : {}),
          ...(block.deletions != null ? { deletions: block.deletions } : {}),
        }
      : undefined;
  const actions: AgentRunAction[] = [];
  if (prHref) actions.push({ href: prHref, label: t("View PR"), kind: "primary" });
  if (agentHref && agentHref !== prHref) {
    actions.push({ href: agentHref, label: t("Open in Web"), kind: "secondary" });
  }

  return (
    <AgentRunCard
      testID="cloud-agent-card"
      title={title}
      tone={tone}
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

export function SubagentCard({
  block,
  accessibilityActions,
  onAccessibilityAction,
  onLongPress,
}: {
  block: Extract<MessageBlock, { kind: "subagent" }>;
  accessibilityActions?: ViewProps["accessibilityActions"];
  onAccessibilityAction?: ViewProps["onAccessibilityAction"];
  onLongPress?: PressableProps["onLongPress"];
}) {
  const { t } = useI18n();
  const statusLabel =
    block.status === "running" ? t("Running") : block.status === "failed" ? t("Failed") : t("Done");
  const tone: AgentRunTone =
    block.status === "running" ? "running" : block.status === "completed" ? "success" : "failed";
  const title = oneLineSummary(block.task) || block.name || t("subagent");
  const summary =
    block.status === "running" ? oneLineSummary(block.progress) : oneLineSummary(block.result);
  const sections: AgentRunSection[] = [];
  const prompt = block.task.trim();
  if (prompt) sections.push({ title: t("Prompt"), body: prompt });
  const progress = block.progress?.trim();
  if (progress && (block.status === "running" || progress)) {
    sections.push({ title: t("Progress"), body: progress });
  }
  const result = block.result?.trim();
  if (result) sections.push({ title: t("Result"), body: result });

  return (
    <AgentRunCard
      testID="subagent-card"
      title={title}
      summary={summary}
      tone={tone}
      status={block.status}
      statusLabel={statusLabel}
      sections={sections}
      actions={[{ label: t("Open"), kind: "primary" }]}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      onLongPress={onLongPress}
    />
  );
}

export function AgentRunStack({
  children,
  kind = "subagent",
}: {
  children: ReactNode;
  kind?: AgentRunStackKind;
}) {
  const tokens = useMobileTokens();
  const { t } = useI18n();
  const items = Children.toArray(children);
  const count = items.length;
  const stacked = count > 1;
  const heading = stacked
    ? kind === "subagent"
      ? t("Started {count} subagents", { count })
      : t("Started {count} agents", { count })
    : undefined;

  return (
    <View
      style={{
        maxWidth: AGENT_RUN_CARD_WIDTH_PX,
        width: "100%",
        alignSelf: "flex-start",
        gap: stacked ? 8 : 0,
        borderRadius: stacked ? 16 : 0,
        backgroundColor: stacked ? tokens.accent : "transparent",
        padding: stacked ? 8 : 0,
      }}
    >
      {heading ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            paddingHorizontal: 8,
            paddingTop: 2,
            paddingBottom: 2,
          }}
        >
          <Text style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 16 }}>
            {heading}
          </Text>
          <NativeSymbol
            ios="chevron.down"
            android="chevron-down"
            size={14}
            color={tokens.mutedForeground}
          />
        </View>
      ) : null}
      {items}
    </View>
  );
}

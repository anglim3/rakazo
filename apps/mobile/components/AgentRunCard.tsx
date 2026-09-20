import type { MessageBlock } from "@rakazo/contracts";
import { cloudAgentHttpsUrl } from "@rakazo/core";
import type { ReactNode } from "react";
import { Children, useState } from "react";
import type { PressableProps, ViewProps } from "react-native";
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useI18n } from "../lib/i18n";
import { useMobileTokens } from "../lib/native";
import { NativeSymbol } from "./native-symbol";

export type AgentRunTone = "running" | "success" | "failed" | "cancelled";
export type AgentRunStackKind = "subagent" | "agent";
export type AgentRunLink = { href: string; label: string };

export const AGENT_RUN_CARD_WIDTH_PX = 360;
export const AGENT_RUN_CARD_HEIGHT_PX = 52;

export function oneLineSummary(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function joinDetail(parts: Array<string | undefined>): string {
  return parts.map(oneLineSummary).filter(Boolean).join(" · ");
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

function StatusGlyph({
  tone,
  label,
  tokens,
}: {
  tone: AgentRunTone;
  label: string;
  tokens: ReturnType<typeof useMobileTokens>;
}) {
  if (tone === "running") {
    return (
      <ActivityIndicator
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        size="small"
        color={tokens.foreground}
        style={{ transform: [{ scale: 0.72 }] }}
      />
    );
  }
  const ios = tone === "success" ? "checkmark" : tone === "cancelled" ? "circle" : "xmark";
  const android =
    tone === "success" ? "checkmark" : tone === "cancelled" ? "ellipse-outline" : "close";
  const color =
    tone === "success"
      ? tokens.foreground
      : tone === "cancelled"
        ? tokens.mutedForeground
        : tokens.destructive;
  return <NativeSymbol ios={ios} android={android} size={14} color={color} />;
}

export function AgentRunCard({
  title,
  summary,
  tone,
  status,
  statusLabel,
  testID,
  lines,
  links,
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
  lines?: Array<string | undefined>;
  links?: AgentRunLink[];
  onLongPress?: PressableProps["onLongPress"];
  accessibilityActions?: ViewProps["accessibilityActions"];
  onAccessibilityAction?: ViewProps["onAccessibilityAction"];
}) {
  const tokens = useMobileTokens();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const summaryText = oneLineSummary(summary);
  const pending = tone === "cancelled";
  const detailLines = uniqueLines(lines?.some(Boolean) ? lines : [summaryText]);
  const detailLinks = links ?? [];

  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${statusLabel}`}
        accessibilityValue={{ text: status }}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        onLongPress={onLongPress}
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={onAccessibilityAction}
        style={{
          height: AGENT_RUN_CARD_HEIGHT_PX,
          maxWidth: AGENT_RUN_CARD_WIDTH_PX,
          width: "100%",
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          overflow: "hidden",
          borderRadius: 8,
          backgroundColor: tokens.background,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            width: 14,
            height: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StatusGlyph tone={tone} label={statusLabel} tokens={tokens} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              color: pending ? tokens.mutedForeground : tokens.foreground,
              fontSize: 13.5,
              fontWeight: "600",
              lineHeight: 18,
              height: 18,
            }}
          >
            {title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: tokens.mutedForeground,
              fontSize: 12,
              lineHeight: 16,
              height: 16,
              marginTop: 2,
            }}
          >
            {summaryText || " "}
          </Text>
        </View>
      </Pressable>
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
            {detailLines.map((line) => (
              <Text
                key={line}
                style={{ color: tokens.foreground, fontSize: 15, lineHeight: 22, marginBottom: 12 }}
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
      ? t("running")
      : block.status === "finished"
        ? t("finished")
        : block.status === "cancelled"
          ? t("cancelled")
          : t("failed");
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
  const summary = prHref ? t("Pull request") : oneLineSummary(block.branch) || t("Cloud agent");
  const links: AgentRunLink[] = [];
  if (prHref) links.push({ href: prHref, label: t("Pull request") });
  if (agentHref && agentHref !== prHref) links.push({ href: agentHref, label: t("Open") });

  return (
    <AgentRunStack kind="agent">
      <AgentRunCard
        testID="cloud-agent-card"
        title={title}
        summary={summary}
        tone={tone}
        status={block.status}
        statusLabel={statusLabel}
        lines={[block.branch]}
        links={links}
      />
    </AgentRunStack>
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
    block.status === "running"
      ? t("Running")
      : block.status === "failed"
        ? t("Failed")
        : t("Completed");
  const tone: AgentRunTone =
    block.status === "running" ? "running" : block.status === "completed" ? "success" : "failed";
  const title = oneLineSummary(block.task) || block.name || t("subagent");
  const summary =
    block.status === "running"
      ? joinDetail([block.progress, block.name !== title ? block.name : undefined])
      : joinDetail([block.result || block.progress, block.name !== title ? block.name : undefined]);

  return (
    <AgentRunStack>
      <AgentRunCard
        testID="subagent-card"
        title={title}
        summary={summary}
        tone={tone}
        status={block.status}
        statusLabel={statusLabel}
        lines={[block.task !== title ? block.task : undefined, block.progress, block.result]}
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={onAccessibilityAction}
        onLongPress={onLongPress}
      />
    </AgentRunStack>
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
        gap: stacked ? 6 : 0,
        borderRadius: 12,
        backgroundColor: tokens.accent,
        padding: stacked ? 6 : 4,
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

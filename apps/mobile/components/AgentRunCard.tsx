import type { MessageBlock } from "@rakazo/contracts";
import { cloudAgentHttpsUrl } from "@rakazo/core";
import type { ReactNode } from "react";
import type { PressableProps, ViewProps } from "react-native";
import { ActivityIndicator, Linking, Pressable, Text, View } from "react-native";
import { useI18n } from "../lib/i18n";
import { useMobileTokens } from "../lib/native";
import { NativeSymbol } from "./native-symbol";

export type AgentRunTone = "running" | "success" | "failed" | "cancelled";

export function oneLineSummary(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function StatusControl({
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
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size="small" color={tokens.foreground} />
      </View>
    );
  }
  const fill =
    tone === "success" ? tokens.success : tone === "cancelled" ? tokens.muted : tokens.destructive;
  const iconColor = tone === "cancelled" ? tokens.warning : tokens.background;
  const ios = tone === "success" ? "checkmark" : tone === "cancelled" ? "minus" : "xmark";
  const android = tone === "success" ? "checkmark" : tone === "cancelled" ? "remove" : "close";
  return (
    <View
      accessibilityLabel={label}
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: fill,
      }}
    >
      <NativeSymbol ios={ios} android={android} size={11} color={iconColor} />
    </View>
  );
}

export function AgentRunCard({
  title,
  summary,
  footer,
  tone,
  status,
  statusLabel,
  testID,
  onPress,
  onLongPress,
  disabled,
  accessibilityRole,
  accessibilityActions,
  onAccessibilityAction,
}: {
  title: string;
  summary?: string;
  footer?: ReactNode;
  tone: AgentRunTone;
  status: string;
  statusLabel: string;
  testID: string;
  onPress?: () => void;
  onLongPress?: PressableProps["onLongPress"];
  disabled?: boolean;
  accessibilityRole?: ViewProps["accessibilityRole"];
  accessibilityActions?: ViewProps["accessibilityActions"];
  onAccessibilityAction?: ViewProps["onAccessibilityAction"];
}) {
  const tokens = useMobileTokens();
  const summaryText = oneLineSummary(summary);
  const body = (
    <View
      testID={testID}
      accessibilityLabel={`${title}: ${statusLabel}`}
      accessibilityValue={{ text: status }}
      style={{
        maxWidth: 380,
        width: "100%",
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.card,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tokens.secondary,
          borderWidth: 1,
          borderColor: tokens.border,
        }}
      >
        <NativeSymbol ios="sparkle" android="sparkles" size={14} color={tokens.mutedForeground} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={1}
          style={{ color: tokens.cardForeground, fontSize: 14, fontWeight: "600", lineHeight: 18 }}
        >
          {title}
        </Text>
        {summaryText ? (
          <Text
            numberOfLines={1}
            style={{ color: tokens.mutedForeground, fontSize: 12.5, lineHeight: 16, marginTop: 2 }}
          >
            {summaryText}
          </Text>
        ) : null}
        {footer ? <View style={{ marginTop: 6 }}>{footer}</View> : null}
      </View>
      <StatusControl tone={tone} label={statusLabel} tokens={tokens} />
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      style={{ maxWidth: "100%", alignSelf: "flex-start" }}
    >
      {body}
    </Pressable>
  );
}

export function CloudAgentCard({
  block,
}: {
  block: Extract<MessageBlock, { kind: "cloud_agent" }>;
}) {
  const { t } = useI18n();
  const tokens = useMobileTokens();
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
  const href = prHref ?? cloudAgentHttpsUrl(block.url);
  const chipStyle = {
    alignSelf: "flex-start" as const,
    maxWidth: "100%" as const,
    borderRadius: 6,
    backgroundColor: tokens.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
  };
  const footer = prHref ? (
    <View style={chipStyle}>
      <Text numberOfLines={1} style={{ color: tokens.mutedForeground, fontSize: 12 }}>
        {t("Pull request")}
      </Text>
    </View>
  ) : block.branch ? (
    <View style={chipStyle}>
      <Text numberOfLines={1} style={{ color: tokens.mutedForeground, fontSize: 12 }}>
        {block.branch}
      </Text>
    </View>
  ) : null;

  return (
    <AgentRunCard
      testID="cloud-agent-card"
      title={title}
      tone={tone}
      status={block.status}
      statusLabel={statusLabel}
      footer={footer}
      onPress={href ? () => Linking.openURL(href).catch(() => undefined) : undefined}
      disabled={!href}
      accessibilityRole={href ? "link" : "text"}
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
    block.status === "running"
      ? t("Running")
      : block.status === "failed"
        ? t("Failed")
        : t("Completed");
  const tone: AgentRunTone =
    block.status === "running" ? "running" : block.status === "completed" ? "success" : "failed";
  const summary =
    block.status === "running"
      ? oneLineSummary(block.progress) || block.task
      : oneLineSummary(block.result) || oneLineSummary(block.progress) || block.task;

  return (
    <AgentRunCard
      testID="subagent-card"
      title={block.name || t("subagent")}
      summary={summary}
      tone={tone}
      status={block.status}
      statusLabel={statusLabel}
      accessibilityRole="text"
      accessibilityActions={accessibilityActions}
      onAccessibilityAction={onAccessibilityAction}
      onLongPress={onLongPress}
    />
  );
}

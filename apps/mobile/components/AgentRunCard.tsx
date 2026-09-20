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

export function joinDetail(parts: Array<string | undefined>): string {
  return parts.map(oneLineSummary).filter(Boolean).join(" · ");
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
      />
    );
  }
  const ios = tone === "success" ? "checkmark" : tone === "cancelled" ? "circle" : "xmark";
  const android =
    tone === "success" ? "checkmark" : tone === "cancelled" ? "ellipse-outline" : "close";
  const color =
    tone === "success"
      ? tokens.success
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
  onPress,
  onLongPress,
  disabled,
  accessibilityRole,
  accessibilityActions,
  onAccessibilityAction,
}: {
  title: string;
  summary?: string;
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
  const pending = tone === "cancelled";
  const body = (
    <View
      testID={testID}
      accessibilityLabel={`${title}: ${statusLabel}`}
      accessibilityValue={{ text: status }}
      style={{
        maxWidth: 360,
        width: "100%",
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: tokens.border,
        backgroundColor: tokens.card,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          width: 16,
          height: 16,
          marginTop: 2,
          alignItems: "center",
          justifyContent: "center",
        }}
        accessibilityLabel={statusLabel}
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
          }}
        >
          {title}
        </Text>
        {summaryText ? (
          <Text
            numberOfLines={1}
            style={{ color: tokens.mutedForeground, fontSize: 12, lineHeight: 16, marginTop: 2 }}
          >
            {summaryText}
          </Text>
        ) : null}
      </View>
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
  const summary = prHref ? t("Pull request") : block.branch;

  return (
    <AgentRunStack>
      <AgentRunCard
        testID="cloud-agent-card"
        title={title}
        summary={summary}
        tone={tone}
        status={block.status}
        statusLabel={statusLabel}
        onPress={href ? () => Linking.openURL(href).catch(() => undefined) : undefined}
        disabled={!href}
        accessibilityRole={href ? "link" : "text"}
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
        accessibilityRole="text"
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={onAccessibilityAction}
        onLongPress={onLongPress}
      />
    </AgentRunStack>
  );
}

export function AgentRunStack({ children }: { children: ReactNode }) {
  const tokens = useMobileTokens();
  return (
    <View
      style={{
        maxWidth: 360,
        width: "100%",
        alignSelf: "flex-start",
        gap: 6,
        borderRadius: 12,
        backgroundColor: tokens.muted,
        padding: 6,
      }}
    >
      {children}
    </View>
  );
}

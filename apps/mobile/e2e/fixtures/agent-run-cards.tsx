import type { MessageBlock } from "@rakazo/contracts";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Pressable, ScrollView, Text, View } from "react-native";
import { CloudAgentCard, SubagentCard } from "../../components/AgentRunCard";
import { setAppearancePreference } from "../../lib/appearance";
import { useMobileTokens } from "../../lib/native";

window.addEventListener("error", (event) => {
  const existing = document.querySelector("[data-testid=playground-error]");
  if (existing) return;
  const el = document.createElement("pre");
  el.dataset.testid = "playground-error";
  el.textContent = event.message;
  document.body.append(el);
});

const params = new URLSearchParams(location.search);
const initialTheme = params.get("theme") === "light" ? "light" : "dark";
document.documentElement.style.colorScheme = initialTheme;

const LONG_PROGRESS =
  "Searching the thread renderer for the compact agent-status row, including Shell MessageView, the mobile thread, and the shared AgentRunCard shell so the muted secondary line stays one truncated row even while this progress text keeps growing.";

const cloudRunning: Extract<MessageBlock, { kind: "cloud_agent" }> = {
  kind: "cloud_agent",
  agentId: "emu-running",
  title: "Add a README",
  status: "running",
  url: "https://cursor.com/agents/abc",
};

const cloudFinished: Extract<MessageBlock, { kind: "cloud_agent" }> = {
  kind: "cloud_agent",
  agentId: "emu-finished",
  title: "Sandbox MCP filesystem paths (#13)",
  status: "finished",
  url: "https://cursor.com/agents/abc",
  branch: "cursor/mcp-path-allowlist-3a30",
  prUrl: "https://github.com/example/demo/pull/24",
  filesChanged: 6,
  additions: 487,
  deletions: 6,
};

const subagentRunning: Extract<MessageBlock, { kind: "subagent" }> = {
  kind: "subagent",
  agentId: "explore-1",
  name: "Explore",
  task: "Map the message card layout in Shell and mobile",
  status: "running",
  progress: LONG_PROGRESS,
};

const subagentCompleted: Extract<MessageBlock, { kind: "subagent" }> = {
  kind: "subagent",
  agentId: "explore-1",
  name: "Explore",
  task: "Map the message card layout in Shell and mobile",
  status: "completed",
  result: "Cards should stay compact with a status mark.",
};

function Shot({ id, children }: { id: string; children: ReactNode }) {
  return (
    <View testID={id} style={{ alignSelf: "flex-start", maxWidth: "100%", padding: 12 }}>
      {children}
    </View>
  );
}

function Case({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  const tokens = useMobileTokens();
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: tokens.mutedForeground, fontSize: 12, fontWeight: "500" }}>
        {label}
      </Text>
      <Shot id={id}>{children}</Shot>
    </View>
  );
}

function DemoApp() {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);
  const tokens = useMobileTokens();

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
    void setAppearancePreference(theme);
  }, [theme]);

  return (
    <ScrollView
      style={{ flex: 1, minHeight: "100%", backgroundColor: tokens.background }}
      contentContainerStyle={{ flexGrow: 1, gap: 24, padding: 24, paddingBottom: 64 }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={theme === "dark" ? "Light" : "Dark"}
        onPress={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        style={{ alignSelf: "flex-end" }}
      >
        <Text style={{ color: tokens.mutedForeground, fontSize: 13 }}>
          {theme === "dark" ? "Light" : "Dark"}
        </Text>
      </Pressable>
      <Case id="shot-subagent-running" label="Local subagent · running">
        <SubagentCard block={subagentRunning} />
      </Case>
      <Case id="shot-subagent-completed" label="Local subagent · completed">
        <SubagentCard block={subagentCompleted} />
      </Case>
      <Case id="shot-cloud-finished" label="Cloud agent · with PR">
        <CloudAgentCard block={cloudFinished} />
      </Case>
      <Case id="shot-cloud-running" label="Cloud agent · no PR">
        <CloudAgentCard block={cloudRunning} />
      </Case>
    </ScrollView>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");
createRoot(root).render(<DemoApp />);

import { describe, expect, it } from "vitest";
import {
  cloudAgentBlockFromPayload,
  cloudAgentHttpsUrl,
  optionalCloudAgentCount,
  pullRequestNumberFromUrl,
} from "./cloud-agent.js";
import { projectMessages } from "./events.js";

describe("shared cloud agent projection", () => {
  it("updates an existing card when replaying durable events", () => {
    const base = { threadId: "thread", createdAt: "2026-01-01T00:00:00Z", botId: "bot" };
    const block = cloudAgentBlockFromPayload({
      agentId: "agent",
      title: "Task",
      status: "running",
      url: "https://example.test/agent",
    });
    const messages = projectMessages([
      {
        ...base,
        id: "first",
        seq: 1,
        type: "thread.message.created",
        payload: { messageId: "card", role: "bot", blocks: [block] },
      },
      {
        ...base,
        id: "second",
        seq: 2,
        type: "thread.cloud_agent",
        payload: {
          ...block,
          messageId: "card",
          status: "finished",
          prUrl: "https://example.test/pr",
        },
      },
    ]);
    expect(messages[0]?.blocks[0]).toMatchObject({
      status: "finished",
      prUrl: "https://example.test/pr",
    });
  });
  it("normalizes invalid statuses and excludes unsafe links on every surface", () => {
    expect(
      cloudAgentBlockFromPayload({
        status: "invalid",
        url: "javascript:alert(1)",
        prUrl: "http://example.test/pr",
      }),
    ).toMatchObject({ status: "running", url: "" });
    for (const url of [
      "javascript:alert(1)",
      "file:///tmp/fake",
      "https://user:password@example.test",
      "invalid",
    ])
      expect(cloudAgentHttpsUrl(url)).toBeUndefined();
  });

  it("copies file stats only when they are real non-negative integers", () => {
    expect(
      cloudAgentBlockFromPayload({
        filesChanged: 6,
        additions: 487,
        deletions: 6,
        url: "https://example.test/agent",
      }),
    ).toMatchObject({ filesChanged: 6, additions: 487, deletions: 6 });
    expect(
      cloudAgentBlockFromPayload({
        filesChanged: -1,
        additions: 1.5,
        deletions: "6",
        url: "https://example.test/agent",
      }),
    ).not.toHaveProperty("filesChanged");
    expect(optionalCloudAgentCount(0)).toBe(0);
    expect(optionalCloudAgentCount(-4)).toBeUndefined();
  });

  it("reads a pull request number from a safe https URL", () => {
    expect(pullRequestNumberFromUrl("https://github.com/example/demo/pull/24")).toBe(24);
    expect(pullRequestNumberFromUrl("https://github.com/example/demo/pull/24/files")).toBe(24);
    expect(pullRequestNumberFromUrl("https://gitlab.example/group/proj/-/merge_requests/8")).toBe(
      8,
    );
    expect(pullRequestNumberFromUrl("javascript:alert(1)")).toBeUndefined();
    expect(pullRequestNumberFromUrl("https://github.com/example/demo")).toBeUndefined();
  });
});

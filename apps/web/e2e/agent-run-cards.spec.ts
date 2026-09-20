import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { captureScreenshot } from "./helpers";

const fixture = "/e2e/fixtures/agent-run-cards.html";
const cardShots = [
  "cloud-running",
  "cloud-finished",
  "subagent-running",
  "subagent-completed",
  "stack",
] as const;
const themes = ["light", "dark"] as const;

const docsDir = path.resolve(
  fileURLToPath(new URL("../../../docs/subagent-card", import.meta.url)),
);
const artifactsDir = "/opt/cursor/artifacts/screenshots";

async function saveShot(testInfo: TestInfo, name: string, sourcePath: string) {
  await testInfo.attach(name, { contentType: "image/png", path: sourcePath });
  if (process.env.UPDATE_AGENT_CARD_DOCS !== "1") return;
  await mkdir(docsDir, { recursive: true });
  await copyFile(sourcePath, path.join(docsDir, `${name}.png`));
  await mkdir(artifactsDir, { recursive: true }).catch(() => undefined);
  await copyFile(sourcePath, path.join(artifactsDir, `${name}.png`)).catch(() => undefined);
}

test("agent run cards match the Cursor panel and open a work dialog", async ({
  page,
}, testInfo) => {
  await page.goto(`${fixture}?theme=dark`);
  const cloud = page.getByTestId("cloud-agent-card");
  const subagent = page.getByTestId("subagent-card");

  await expect(cloud).toHaveCount(2);
  await expect(subagent).toHaveCount(2);

  const runningCloud = page.locator('[data-testid="cloud-agent-card"][data-status="running"]');
  const finishedCloud = page.locator('[data-testid="cloud-agent-card"][data-status="finished"]');
  await expect(runningCloud).toBeVisible();
  await expect(finishedCloud).toBeVisible();
  await expect(finishedCloud).toContainText("Done");
  await expect(finishedCloud).toContainText("cursor/mcp-path-allowlist-3a30 PR #24");
  await expect(finishedCloud).toContainText("6 files changed");
  await expect(finishedCloud).toContainText("+487");
  await expect(finishedCloud).toContainText("-6");
  await expect(finishedCloud.getByRole("link", { name: "View PR" })).toHaveAttribute(
    "href",
    "https://github.com/example/demo/pull/24",
  );
  await expect(finishedCloud.getByRole("link", { name: "Open in Web" })).toHaveAttribute(
    "href",
    "https://cursor.com/agents/abc",
  );
  await expect(runningCloud).toContainText("Running");
  await expect(runningCloud.getByRole("link", { name: "Open in Web" })).toBeVisible();
  await expect(runningCloud.getByRole("link", { name: "View PR" })).toHaveCount(0);
  await expect(runningCloud).not.toContainText("files changed");
  await expect(page.getByTestId("agent-run-stack")).toHaveCount(1);
  await expect(page.getByTestId("shot-stack").getByTestId("agent-run-stack")).toBeVisible();
  await expect(page.getByTestId("shot-stack").getByTestId("agent-run-stack-heading")).toContainText(
    "Started 4 subagents",
  );
  await expect(runningCloud.locator('[role="status"]')).toBeVisible();

  await expect(subagent.first()).toHaveAttribute("data-status", "running");
  await expect(subagent.last()).toHaveAttribute("data-status", "completed");
  await expect(subagent.first()).toContainText("Map the message card layout");
  await expect(subagent.first()).toContainText("Searching the thread renderer");
  await expect(subagent.last()).toContainText("Cards should stay compact");
  await expect(subagent.first()).toContainText("Running");
  await expect(subagent.last()).toContainText("Done");

  const runningBox = await runningCloud.boundingBox();
  const longBox = await page
    .getByTestId("shot-subagent-running")
    .getByTestId("subagent-card")
    .boundingBox();
  const completedBox = await page
    .getByTestId("shot-subagent-completed")
    .getByTestId("subagent-card")
    .boundingBox();
  expect(runningBox).toBeTruthy();
  expect(longBox).toBeTruthy();
  expect(completedBox).toBeTruthy();
  expect(runningBox!.width).toBeGreaterThanOrEqual(480);
  expect(runningBox!.width).toBeLessThanOrEqual(520);
  expect(longBox!.width).toBe(runningBox!.width);
  expect(longBox!.height).toBeGreaterThan(70);
  expect(longBox!.height).toBeLessThan(160);
  expect(Math.abs(longBox!.height - completedBox!.height)).toBeLessThan(2);

  const longCard = page.getByTestId("shot-subagent-running").getByTestId("subagent-card");
  await longCard.getByRole("button").click();
  const dialog = page.getByTestId("agent-run-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Searching the thread renderer for the compact");
  await expect(dialog).toContainText("Running");
  const cardAfterOpen = await longCard.boundingBox();
  expect(cardAfterOpen!.height).toBe(longBox!.height);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  await finishedCloud.getByRole("button").click();
  await expect(page.getByTestId("agent-run-dialog")).toBeVisible();
  await expect(
    page.getByTestId("agent-run-dialog").getByRole("link", { name: "View PR" }),
  ).toHaveAttribute("href", "https://github.com/example/demo/pull/24");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("agent-run-dialog")).toHaveCount(0);

  for (const theme of themes) {
    await page.goto(`${fixture}?theme=${theme}`);
    await expect(page.getByTestId("cloud-agent-card").first()).toBeVisible();
    for (const shot of cardShots) {
      const target = page.getByTestId(`shot-${shot}`);
      await expect(target).toBeVisible();
      const screenshotPath = testInfo.outputPath(`after-${shot}-${theme}.png`);
      await target.screenshot({ animations: "disabled", path: screenshotPath });
      await saveShot(testInfo, `after-${shot}-${theme}`, screenshotPath);
      if (theme === "light" && shot !== "stack") {
        await saveShot(testInfo, `after-${shot}`, screenshotPath);
      }
      if (theme === "light" && shot === "stack") {
        await saveShot(testInfo, "after-stack", screenshotPath);
      }
      if (theme === "dark" && shot === "cloud-finished") {
        await saveShot(testInfo, "after-cloud-finished-dark", screenshotPath);
      }
    }
    await page
      .getByTestId("shot-subagent-running")
      .getByTestId("subagent-card")
      .getByRole("button")
      .click();
    const workDialog = page.getByTestId("agent-run-dialog");
    await expect(workDialog).toBeVisible();
    const dialogPath = testInfo.outputPath(`after-dialog-running-${theme}.png`);
    await workDialog.screenshot({ animations: "disabled", path: dialogPath });
    await saveShot(testInfo, `after-dialog-running-${theme}`, dialogPath);
    await page.keyboard.press("Escape");
  }

  await captureScreenshot(page, testInfo, "agent-run-cards-dark");
});

test("legacy agent cards remain available for visual comparison", async ({ page }, testInfo) => {
  for (const theme of themes) {
    await page.goto(`${fixture}?gallery=legacy&theme=${theme}`);
    await expect(page.getByTestId("legacy-cloud-agent-card")).toHaveCount(2);
    await expect(page.getByTestId("legacy-subagent-card")).toHaveCount(2);
    await expect(page.getByTestId("legacy-cloud-agent-card").first()).toContainText("running");
    await expect(page.getByTestId("legacy-subagent-card").last()).toContainText("completed");

    for (const shot of [
      "cloud-running",
      "cloud-finished",
      "subagent-running",
      "subagent-completed",
    ] as const) {
      const target = page.getByTestId(`shot-${shot}`);
      await expect(target).toBeVisible();
      const screenshotPath = testInfo.outputPath(`before-${shot}-${theme}.png`);
      await target.screenshot({ animations: "disabled", path: screenshotPath });
      await saveShot(testInfo, `before-${shot}-${theme}`, screenshotPath);
      if (theme === "dark") {
        await saveShot(testInfo, `before-${shot}`, screenshotPath);
      }
    }
  }
});

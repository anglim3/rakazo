import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { captureScreenshot } from "./helpers";

const fixture = "/e2e/fixtures/agent-run-cards.html";
const shots = [
  "cloud-running",
  "cloud-finished",
  "subagent-running",
  "subagent-completed",
] as const;

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

test("agent run cards match the compact panel layout", async ({ page }, testInfo) => {
  await page.goto(`${fixture}?theme=dark`);
  const cloud = page.getByTestId("cloud-agent-card");
  const subagent = page.getByTestId("subagent-card");

  await expect(cloud).toHaveCount(2);
  await expect(subagent).toHaveCount(2);

  const runningCloud = page.locator('[data-testid="cloud-agent-card"][data-status="running"]');
  const finishedCloud = page.locator('[data-testid="cloud-agent-card"][data-status="finished"]');
  await expect(runningCloud).toBeVisible();
  await expect(finishedCloud).toBeVisible();
  await expect(finishedCloud).toContainText("Pull request");
  await expect(page.getByTestId("agent-run-stack")).toHaveCount(5);
  await expect(page.getByTestId("shot-stack").getByTestId("agent-run-stack")).toBeVisible();
  await expect(finishedCloud.locator("xpath=ancestor::a[1]")).toHaveAttribute(
    "href",
    "https://github.com/example/demo/pull/1",
  );
  await expect(runningCloud.locator('[role="status"]')).toBeVisible();

  await expect(subagent.first()).toHaveAttribute("data-status", "running");
  await expect(subagent.last()).toHaveAttribute("data-status", "completed");
  await expect(subagent.first()).toContainText("Map the message card layout");
  await expect(subagent.first()).toContainText("Searching the thread renderer");
  await expect(subagent.last()).toContainText("Cards should stay compact");

  const box = await runningCloud.boundingBox();
  expect(box).toBeTruthy();
  expect(box!.width).toBeGreaterThanOrEqual(320);
  expect(box!.width).toBeLessThanOrEqual(420);

  await page.goto(`${fixture}?theme=light`);
  await expect(page.getByTestId("cloud-agent-card").first()).toBeVisible();
  for (const shot of shots) {
    const target = page.getByTestId(`shot-${shot}`);
    await expect(target).toBeVisible();
    const screenshotPath = testInfo.outputPath(`after-${shot}.png`);
    await target.screenshot({ animations: "disabled", path: screenshotPath });
    await saveShot(testInfo, `after-${shot}`, screenshotPath);
  }
  const stackPath = testInfo.outputPath("after-stack.png");
  await page.getByTestId("shot-stack").screenshot({ animations: "disabled", path: stackPath });
  await saveShot(testInfo, "after-stack", stackPath);

  await page.goto(`${fixture}?theme=dark`);
  const darkFinished = testInfo.outputPath("after-cloud-finished-dark.png");
  await page.getByTestId("shot-cloud-finished").screenshot({
    animations: "disabled",
    path: darkFinished,
  });
  await saveShot(testInfo, "after-cloud-finished-dark", darkFinished);

  await captureScreenshot(page, testInfo, "agent-run-cards-dark");
});

test("legacy agent cards remain available for visual comparison", async ({ page }, testInfo) => {
  await page.goto(`${fixture}?gallery=legacy&theme=dark`);
  await expect(page.getByTestId("legacy-cloud-agent-card")).toHaveCount(2);
  await expect(page.getByTestId("legacy-subagent-card")).toHaveCount(2);
  await expect(page.getByTestId("legacy-cloud-agent-card").first()).toContainText("running");
  await expect(page.getByTestId("legacy-subagent-card").last()).toContainText("completed");

  for (const shot of shots) {
    const target = page.getByTestId(`shot-${shot}`);
    await expect(target).toBeVisible();
    const screenshotPath = testInfo.outputPath(`before-${shot}.png`);
    await target.screenshot({ animations: "disabled", path: screenshotPath });
    await saveShot(testInfo, `before-${shot}`, screenshotPath);
  }
});

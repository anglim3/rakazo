import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Locator, Page, TestInfo } from "@playwright/test";
import { expect, test } from "@playwright/test";

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

async function screenshot(testInfo: TestInfo, name: string, target: Locator) {
  const shotPath = testInfo.outputPath(`${name}.png`);
  await target.screenshot({ animations: "disabled", path: shotPath });
  await saveShot(testInfo, name, shotPath);
}

async function openCompletedSheet(page: Page) {
  const completed = page.getByTestId("shot-subagent-completed");
  await completed.getByTestId("agent-run-open").click();
  const sheet = page.getByTestId("agent-run-dialog");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText("Prompt", { exact: true })).toBeVisible();
  await expect(sheet.getByText("Progress", { exact: true })).toBeVisible();
  await expect(sheet.getByText("Result", { exact: true })).toBeVisible();
  return sheet;
}

async function assertFourCases(page: Page) {
  const running = page.getByTestId("shot-subagent-running");
  const completed = page.getByTestId("shot-subagent-completed");
  const finished = page.getByTestId("shot-cloud-finished");
  const cloudRunning = page.getByTestId("shot-cloud-running");
  await expect(running.getByTestId("agent-run-open")).toBeVisible();
  await expect(running.getByText("Open in Web")).toHaveCount(0);
  await expect(completed.getByTestId("agent-run-open")).toBeVisible();
  await expect(finished.getByText("View PR")).toBeVisible();
  await expect(finished.getByText("Open in Web")).toBeVisible();
  await expect(cloudRunning.getByText("Open in Web")).toBeVisible();
  await expect(cloudRunning.getByText("View PR")).toHaveCount(0);
  return { running, completed, finished, cloudRunning };
}

test("real mobile AgentRunCard cases, Open sheet, and split menu", async ({ page }, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/e2e/fixtures/agent-run-cards.html?theme=dark");
  await expect(page.getByTestId("subagent-card")).toHaveCount(2);
  await expect(page.getByTestId("cloud-agent-card")).toHaveCount(2);

  const dark = await assertFourCases(page);
  await screenshot(testInfo, "mobile-subagent-running", dark.running);
  await screenshot(testInfo, "mobile-subagent-completed", dark.completed);
  await screenshot(testInfo, "mobile-cloud-finished", dark.finished);
  await screenshot(testInfo, "mobile-cloud-running", dark.cloudRunning);

  const sheet = await openCompletedSheet(page);
  await screenshot(testInfo, "mobile-subagent-open", sheet);
  await page.getByLabel("Close").click();
  await expect(sheet).toBeHidden();

  await dark.cloudRunning.getByLabel("More").click();
  const menu = page.getByTestId("agent-run-web-action-sheet");
  await expect(menu.getByRole("menuitem", { name: "Open in Web" })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: "Copy link" })).toBeVisible();
  const menuPath = testInfo.outputPath("mobile-cloud-running-menu.png");
  await page.screenshot({ animations: "disabled", path: menuPath });
  await saveShot(testInfo, "mobile-cloud-running-menu", menuPath);

  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/e2e/fixtures/agent-run-cards.html?theme=light");
  const light = await assertFourCases(page);
  await screenshot(testInfo, "mobile-subagent-running-light", light.running);
  await screenshot(testInfo, "mobile-cloud-finished-light", light.finished);
  const lightSheet = await openCompletedSheet(page);
  await screenshot(testInfo, "mobile-subagent-open-light", lightSheet);
});

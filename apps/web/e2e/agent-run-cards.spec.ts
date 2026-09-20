import { expect, test } from "@playwright/test";
import { captureScreenshot } from "./helpers";

const fixture = "/e2e/fixtures/agent-run-cards.html";

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
  await expect(runningCloud.getByTestId("agent-run-open-web-menu")).toBeVisible();
  await runningCloud.getByTestId("agent-run-open-web-menu").click();
  await expect(page.getByRole("menuitem", { name: "Open in Web" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Copy link" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem", { name: "Copy link" })).toHaveCount(0);
  await expect(runningCloud.getByRole("link", { name: "View PR" })).toHaveCount(0);
  await expect(runningCloud).not.toContainText("View PR");
  await expect(runningCloud).not.toContainText("PR #");
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
  expect(longBox!.height).toBeLessThan(200);
  expect(Math.abs(longBox!.height - completedBox!.height)).toBeLessThan(2);

  const longCard = page.getByTestId("shot-subagent-running").getByTestId("subagent-card");
  await expect(longCard.getByTestId("agent-run-open")).toBeVisible();
  await expect(longCard.getByRole("button", { name: "Open", exact: true })).toBeVisible();
  await expect(longCard.getByRole("link", { name: "Open in Web" })).toHaveCount(0);
  await expect(longCard.getByRole("link", { name: "View PR" })).toHaveCount(0);
  await expect(longCard).not.toContainText("View PR");
  await expect(longCard).not.toContainText("PR #");
  await expect(longCard).not.toContainText("files changed");
  await expect(
    page.getByTestId("shot-subagent-completed").getByTestId("agent-run-open"),
  ).toBeVisible();
  await expect(subagent.getByRole("link", { name: "Open in Web" })).toHaveCount(0);

  await longCard.getByTestId("agent-run-open").click();
  const dialog = page.getByTestId("agent-run-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Prompt" })).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Progress" })).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Result" })).toHaveCount(0);
  await expect(dialog.getByRole("heading", { name: "Code changes" })).toHaveCount(0);
  await expect(dialog).toContainText("Map the message card layout in Shell and mobile");
  await expect(dialog).toContainText("Searching the thread renderer for the compact");
  await expect(dialog).toContainText("Running");
  await expect(dialog.getByRole("link", { name: "Open in Web" })).toHaveCount(0);
  await expect(dialog.getByRole("link", { name: "View PR" })).toHaveCount(0);
  const cardAfterOpen = await longCard.boundingBox();
  expect(cardAfterOpen!.height).toBe(longBox!.height);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);

  await page
    .getByTestId("shot-subagent-completed")
    .getByTestId("subagent-card")
    .locator("button[aria-haspopup='dialog']")
    .first()
    .click();
  const completedDialog = page.getByTestId("agent-run-dialog");
  await expect(completedDialog).toBeVisible();
  await expect(completedDialog.getByRole("heading", { name: "Prompt" })).toBeVisible();
  await expect(completedDialog.getByRole("heading", { name: "Result" })).toBeVisible();
  await expect(completedDialog.getByRole("heading", { name: "Progress" })).toHaveCount(0);
  await expect(completedDialog.getByRole("heading", { name: "Code changes" })).toHaveCount(0);
  await expect(completedDialog).toContainText("Cards should stay compact with a status mark.");
  await expect(completedDialog.getByRole("link", { name: "View PR" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(completedDialog).toHaveCount(0);

  await runningCloud.locator("button[aria-haspopup='dialog']").click();
  const runningCloudDialog = page.getByTestId("agent-run-dialog");
  await expect(runningCloudDialog).toBeVisible();
  await expect(runningCloudDialog.getByRole("link", { name: "View PR" })).toHaveCount(0);
  await expect(runningCloudDialog.getByRole("link", { name: "Open in Web" })).toHaveAttribute(
    "href",
    "https://cursor.com/agents/abc",
  );
  await page.keyboard.press("Escape");
  await expect(runningCloudDialog).toHaveCount(0);

  await finishedCloud.locator("button[aria-haspopup='dialog']").click();
  await expect(page.getByTestId("agent-run-dialog")).toBeVisible();
  await expect(
    page.getByTestId("agent-run-dialog").getByRole("link", { name: "View PR" }),
  ).toHaveAttribute("href", "https://github.com/example/demo/pull/24");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("agent-run-dialog")).toHaveCount(0);

  await captureScreenshot(page, testInfo, "agent-run-cards-dark");
});

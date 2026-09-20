import { defineConfig, devices } from "@playwright/test";

const iPhone = devices["iPhone 14"];

export default defineConfig({
  testDir: "./e2e",
  testMatch: "mobile-agent-run-cards.spec.ts",
  fullyParallel: false,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5188",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    browserName: "chromium",
    viewport: iPhone.viewport,
    userAgent: iPhone.userAgent,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: iPhone.deviceScaleFactor,
  },
  webServer: {
    command:
      "pnpm --config.engine-strict=false exec vite --config vite.mobile-agent-cards.config.ts",
    url: "http://127.0.0.1:5188/e2e/fixtures/agent-run-cards.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { defineConfig, devices } from "@playwright/test";
import { randomUUID } from "crypto";

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  workers: 1,
  reporter: process.env.CI ? "github" : "html",
  timeout: 10 * 1000,
  use: {
    baseURL: "http://localhost:3310",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: !!process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run start",
    port: 3310,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    env: {
      MT_HOME: `/tmp/mt-e2e-test-${randomUUID()}`,
      MT_PORT: "3310",
      NODE_ENV: "production",
    },
  },
});

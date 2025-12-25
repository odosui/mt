import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://localhost:3310",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run build && npm run start",
    port: 3310,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    env: {
      MT_HOME: "/tmp/mt-e2e-test-notes",
      PORT: "3310",
      NODE_ENV: "production",
    },
  },
});

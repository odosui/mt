import { expect, test } from "@playwright/test";

test.describe("Settings", () => {
  test("F11: should display version and commit hash", async ({ page: p }) => {
    await p.goto("/app/settings");

    // Check that version label and value are visible
    await expect(p.getByText("Version")).toBeVisible();
    await expect(p.getByText(/v\d+\.\d+\.\d+/)).toBeVisible();

    // Check that commit hash label and value are visible
    await expect(p.getByText("Commit")).toBeVisible();
    await expect(p.getByText(/[a-f0-9]{7,}/)).toBeVisible();
  });
});

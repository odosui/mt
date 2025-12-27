import { expect, test } from "@playwright/test";

test.describe("Notes", () => {
  // test.beforeEach(async ({ cleanNotesDir }) => {
  //   // cleanNotesDir fixture automatically cleans the directory
  // });

  test("should display empty state when no notes exist", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("aside")).toContainText("KNOWLEDGE BASE");
    await page.locator("aside").getByRole("link", { name: /Notes/ }).click();
    await expect(page.locator(".notes-items")).toContainText(
      "Click the pencil icon to add your first note.",
    );
    await expect(
      page
        .locator(".note-area")
        .getByRole("button", { name: "Create you first note" }),
    ).toBeVisible();
  });

  test("should create a new note", async ({ page }) => {
    await page.goto("/app/notes");

    await page.locator(".newNote").first().click();

    // in edit mode now

    const saveBtn = page.locator('button:has-text("Save")').first();
    await expect(saveBtn).toBeDisabled();

    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    await expect(cancelBtn).toBeEnabled();

    const editor = page.locator("textarea").first();
    await editor.fill(
      "# My First Test Note\n\nThis is a test note created by Playwright \n\n #e2e",
    );

    await page.locator('button:has-text("Save")').first().click();

    await expect(
      page.locator(".notes-items").locator("text=My First Test Note"),
    ).toBeVisible();

    const editBtn = page.locator('button:has-text("Edit")').first();
    await expect(editBtn).toBeEnabled();

    // tags are updated
    await expect(
      page.locator(".menu-tags div", { hasText: "e2e1" }), // = e2e tag has 1 note
    ).toBeVisible();
  });

  test("should cancel editing without saving changes", async ({ page }) => {
    await page.goto("/app/notes");

    // Create a note first
    await page.locator(".newNote").first().click();
    const editor = page.locator("textarea").first();
    await editor.fill("# Original Content\n\nThis is the original text");
    await page.locator('button:has-text("Save")').first().click();
    await expect(
      page.locator(".notes-items").locator("text=Original Content"),
    ).toBeVisible();

    // Enter edit mode
    await page.locator('button:has-text("Edit")').first().click();

    // Make changes
    const editorAgain = page.locator("textarea").first();
    await editorAgain.fill("# Modified Content\n\nThis should not be saved");

    // Click Cancel
    await page.locator('button:has-text("Cancel")').first().click();

    await expect(
      page.locator(".notes-items").locator("text=Original Content"),
    ).toBeVisible();
    await expect(
      page.locator(".notes-items").locator("text=Modified Content"),
    ).not.toBeVisible();
  });

  // test("should delete a note", async ({ page }) => {
  //   await page.goto("/app/notes");

  //   // Create a note first
  //   await page.locator(".newNote").first().click();
  //   const editor = page.locator("textarea").first();
  //   await editor.fill(
  //     "# Note to Delete\n\nThis note will be deleted \n\n #temp",
  //   );
  //   await page.locator('button:has-text("Save")').first().click();

  //   // Wait for note to appear
  //   await expect(page.locator("text=Note to Delete")).toBeVisible({
  //   });

  //   await expect(
  //     page.locator(".menu-tags div", { hasText: "temp1" }),
  //   ).toBeVisible();

  //   await page.locator('.menu-action-more[title="More menu items"]').click();

  //   // confirm deletion
  //   page.once("dialog", async (d) => {
  //     expect(d.message()).toContain("Are you sure want to delete this note?");
  //     await d.accept();
  //   });
  //   await page.locator(':has-text("Delete note")').first().click();

  //   // Verify note is deleted
  //   await expect(page.locator("text=Note to Delete")).not.toBeVisible({
  //   });

  //   await expect(
  //     page.locator(".menu-tags div", { hasText: "temp1" }),
  //   ).not.toBeVisible();
  // });

  test("should filter by tag", async ({ page }) => {
    // todo
  });

  test("should filter by text", async ({ page }) => {
    // todo
  });
});

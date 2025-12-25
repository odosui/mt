import { expect, test } from "../fixtures/test-helpers";

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

  // test("should create a new note", async ({ page }) => {
  //   await page.goto("/");

  //   // Wait for page to load
  //   await page.waitForLoadState("networkidle");

  //   // Look for "New Note" or "+" button - adjust selector based on your UI
  //   const newNoteButton = page
  //     .locator(
  //       'button:has-text("New"), button:has-text("+"), [data-testid="new-note-button"]',
  //     )
  //     .first();
  //   await newNoteButton.click();

  //   // Wait for editor to appear
  //   await page.waitForSelector('textarea, [contenteditable="true"], .editor', {
  //     timeout: 5000,
  //   });

  //   // Type note content
  //   const editor = page
  //     .locator('textarea, [contenteditable="true"], .editor')
  //     .first();
  //   await editor.fill(
  //     "# My First Test Note\n\nThis is a test note created by Playwright #test-tag",
  //   );

  //   // Save the note - look for Save button
  //   const saveButton = page
  //     .locator('button:has-text("Save"), [data-testid="save-button"]')
  //     .first();
  //   await saveButton.click();

  //   // Wait for navigation back to list or confirmation
  //   await page.waitForLoadState("networkidle");

  //   // Verify note appears in the list
  //   await expect(page.locator("text=My First Test Note")).toBeVisible({
  //     timeout: 5000,
  //   });
  // });

  // test("should display existing notes", async ({ page }) => {
  //   // Create a test note directly in the filesystem
  //   createTestNote(
  //     "test-note.md",
  //     "# Test Note\n\nThis is a pre-existing note #existing",
  //   );

  //   await page.goto("/");
  //   await page.waitForLoadState("networkidle");

  //   // Verify the note is displayed
  //   await expect(page.locator("text=Test Note")).toBeVisible({ timeout: 5000 });
  // });

  // test("should filter notes by tag", async ({ page }) => {
  //   // Create multiple notes with different tags
  //   createTestNote("note1.md", "# Note One\n\nContent with #tag1");
  //   createTestNote("note2.md", "# Note Two\n\nContent with #tag2");
  //   createTestNote("note3.md", "# Note Three\n\nContent with #tag1 and #tag2");

  //   await page.goto("/");
  //   await page.waitForLoadState("networkidle");

  //   // Click on a tag to filter (adjust selector based on your UI)
  //   const tag1 = page.locator('text=#tag1, [data-tag="tag1"]').first();
  //   await tag1.click();

  //   // Verify filtered results
  //   await expect(page.locator("text=Note One")).toBeVisible();
  //   await expect(page.locator("text=Note Three")).toBeVisible();
  // });

  // test("should edit an existing note", async ({ page }) => {
  //   createTestNote("editable-note.md", "# Original Title\n\nOriginal content");

  //   await page.goto("/");
  //   await page.waitForLoadState("networkidle");

  //   // Click on the note to open it
  //   await page.locator("text=Original Title").click();

  //   // Wait for editor
  //   await page.waitForSelector('textarea, [contenteditable="true"], .editor', {
  //     timeout: 5000,
  //   });

  //   // Edit the content
  //   const editor = page
  //     .locator('textarea, [contenteditable="true"], .editor')
  //     .first();
  //   await editor.fill("# Updated Title\n\nUpdated content");

  //   // Save
  //   const saveButton = page.locator('button:has-text("Save")').first();
  //   await saveButton.click();

  //   await page.waitForLoadState("networkidle");

  //   // Verify the update
  //   await expect(page.locator("text=Updated Title")).toBeVisible();
  // });

  // test("should delete a note", async ({ page }) => {
  //   createTestNote(
  //     "deletable-note.md",
  //     "# Note to Delete\n\nThis will be deleted",
  //   );

  //   await page.goto("/");
  //   await page.waitForLoadState("networkidle");

  //   // Click on the note
  //   await page.locator("text=Note to Delete").click();

  //   // Look for delete button (adjust selector based on your UI)
  //   const deleteButton = page
  //     .locator('button:has-text("Delete"), [data-testid="delete-button"]')
  //     .first();
  //   await deleteButton.click();

  //   // Confirm deletion if there's a confirmation dialog
  //   const confirmButton = page
  //     .locator(
  //       'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")',
  //     )
  //     .first();
  //   if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
  //     await confirmButton.click();
  //   }

  //   await page.waitForLoadState("networkidle");

  //   // Verify note is gone
  //   await expect(page.locator("text=Note to Delete")).not.toBeVisible();
  // });

  // test("should toggle favorite status", async ({ page }) => {
  //   createTestNote("favorite-note.md", "# Favorite Test\n\nTest favoriting");

  //   await page.goto("/");
  //   await page.waitForLoadState("networkidle");

  //   // Click on the note
  //   await page.locator("text=Favorite Test").click();

  //   // Look for favorite/star button
  //   const favoriteButton = page
  //     .locator(
  //       'button:has-text("★"), button:has-text("☆"), [data-testid="favorite-button"]',
  //     )
  //     .first();
  //   await favoriteButton.click();

  //   // Verify the favorite status changed (visual indicator)
  //   // This will depend on your UI implementation
  // });
});

import { expect, test } from "@playwright/test";
import {
  clickTag,
  expectNoNoteItem,
  expectNoteItem,
  expectTag,
  saveBtn,
  cancelBtn,
  newNoteBtn,
  noteTA,
  editBtn,
} from "./helpers";

test.describe("Notes", () => {
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

  test("should create a new note", async ({ page: p }) => {
    await p.goto("/app/notes");

    await newNoteBtn(p).click();

    // in edit mode now
    await expect(saveBtn(p)).toBeDisabled();
    await expect(cancelBtn(p)).toBeEnabled();

    await noteTA(p).fill(
      "# My First Test Note\n\nThis is a test note created by Playwright \n\n #e2e",
    );
    await saveBtn(p).click();
    await expectNoteItem(p, "My First Test Note");
    await expect(editBtn(p)).toBeEnabled();

    // tags are updated
    await expectTag(p, "e2e", 1);
  });

  test("should cancel editing without saving changes", async ({ page: p }) => {
    await p.goto("/app/notes");

    // Create a note first
    await newNoteBtn(p).click();
    await noteTA(p).fill("# Original Content\n\nThis is the original text");
    await saveBtn(p).click();
    await expectNoteItem(p, "Original Content");

    // Enter edit mode
    await editBtn(p).click();

    // Make changes
    await noteTA(p).fill("# Modified Content\n\nThis should not be saved");

    // Click Cancel
    await p.locator('button:has-text("Cancel")').first().click();

    await expectNoteItem(p, "Original Content");
    await expectNoNoteItem(p, "Modified Content");
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

  test("should filter by tag", async ({ page: p }) => {
    await p.goto("/app/notes");

    // Create first note with #javascript tag
    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# JavaScript Basics\n\nLearn about variables and functions \n\n #javascript",
    );
    await saveBtn(p).click();
    await expectNoteItem(p, "JavaScript Basics");

    // Create second note with #python tag
    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# Python Tutorial\n\nPython is a great language \n\n #python",
    );
    await saveBtn(p).click();
    await expectNoteItem(p, "Python Tutorial");

    // Create third note with #javascript tag
    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# Advanced JavaScript\n\nAsync/await and promises \n\n #javascript",
    );
    await saveBtn(p).click();
    await expectNoteItem(p, "Advanced JavaScript");

    await expectTag(p, "javascript", 2);
    await expectTag(p, "python", 1);

    await clickTag(p, "javascript");
    await expectNoteItem(p, "JavaScript Basics");
    await expectNoteItem(p, "Advanced JavaScript");
    await expectNoNoteItem(p, "Python Tutorial");

    await clickTag(p, "python");
    await expectNoteItem(p, "Python Tutorial");
    await expectNoNoteItem(p, "JavaScript Basics");
    await expectNoNoteItem(p, "Advanced JavaScript");
  });

  test("should filter by text", async ({ page }) => {
    // todo
  });
});

import { expect, test } from "@playwright/test";
import {
  expectTag,
  saveBtn,
  cancelBtn,
  newNoteBtn,
  noteTA,
  editBtn,
  noteItem,
  moreMenuBtn,
  delBtn,
  tagItem,
  favBtn,
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
    await expect(noteItem(p, "My First Test Note")).toBeVisible();
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
    await expect(noteItem(p, "Original Content")).toBeVisible();

    // Enter edit mode
    await editBtn(p).click();

    // Make changes
    await noteTA(p).fill("# Modified Content\n\nThis should not be saved");

    // Click Cancel
    await p.locator('button:has-text("Cancel")').first().click();

    await expect(noteItem(p, "Original Content")).toBeVisible();
    await expect(noteItem(p, "Modified Content")).not.toBeVisible();
  });

  test("should delete a note", async ({ page: p }) => {
    await p.goto("/app/notes");

    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# Note to Delete\n\nThis note will be deleted \n\n #temp",
    );
    await saveBtn(p).click();
    await expect(noteItem(p, "Note to Delete")).toBeVisible();
    await expectTag(p, "temp", 1);

    await moreMenuBtn(p).click();

    // confirm deletion
    p.once("dialog", async (d) => {
      expect(d.message()).toContain("Are you sure want to delete this note?");
      await d.accept();
    });
    await delBtn(p).click();

    // Verify note is deleted
    await expect(noteItem(p, "Note to Delete")).not.toBeVisible();
    await expect(tagItem(p, "temp")).not.toBeVisible({
      timeout: 20000,
    });
  });

  test("should filter by tag", async ({ page: p }) => {
    await p.goto("/app/notes");

    // Create first note with #javascript tag
    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# JavaScript Basics\n\nLearn about variables and functions \n\n #javascript",
    );
    await saveBtn(p).click();
    await expect(noteItem(p, "JavaScript Basics")).toBeVisible();

    // Create second note with #python tag
    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# Python Tutorial\n\nPython is a great language \n\n #python",
    );
    await saveBtn(p).click();
    await expect(noteItem(p, "Python Tutorial")).toBeVisible();

    // Create third note with #javascript tag
    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# Advanced JavaScript\n\nAsync/await and promises \n\n #javascript",
    );
    await saveBtn(p).click();
    await expect(noteItem(p, "Advanced JavaScript")).toBeVisible();

    await expectTag(p, "javascript", 2);
    await expectTag(p, "python", 1);

    await tagItem(p, "javascript").click();
    await expect(noteItem(p, "JavaScript Basics")).toBeVisible();
    await expect(noteItem(p, "Advanced JavaScript")).toBeVisible();
    await expect(noteItem(p, "Python Tutorial")).not.toBeVisible();

    await tagItem(p, "python").click();
    await expect(noteItem(p, "Python Tutorial")).toBeVisible();
    await expect(noteItem(p, "JavaScript Basics")).not.toBeVisible();
    await expect(noteItem(p, "Advanced JavaScript")).not.toBeVisible();
  });

  test("should filter by text", async ({ page: p }) => {
    await p.goto("/app/notes");

    // Create first note about JavaScript
    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# JavaScript Promises\n\nLearn about async/await and promises in JavaScript\n\n#javascript",
    );
    await saveBtn(p).click();
    await expect(noteItem(p, "JavaScript Promises")).toBeVisible();

    // Create second note about Python
    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# Python Decorators\n\nUnderstanding decorators in Python\n\n#python",
    );
    await saveBtn(p).click();
    await expect(noteItem(p, "Python Decorators")).toBeVisible();

    // Create third note about TypeScript
    await newNoteBtn(p).click();
    await noteTA(p).fill(
      "# TypeScript Generics\n\nMastering generics in TypeScript\n\n#typescript",
    );
    await saveBtn(p).click();
    await expect(noteItem(p, "TypeScript Generics")).toBeVisible();

    // All notes should be visible initially
    await expect(noteItem(p, "JavaScript Promises")).toBeVisible();
    await expect(noteItem(p, "Python Decorators")).toBeVisible();
    await expect(noteItem(p, "TypeScript Generics")).toBeVisible();

    // Filter by "Python"
    const searchInput = p.getByRole("searchbox", { name: "Search notes" });
    await searchInput.fill("Python");

    // Wait for debounced search (500ms + buffer)
    await p.waitForTimeout(600);

    // Only Python note should be visible
    await expect(noteItem(p, "Python Decorators")).toBeVisible();
    await expect(noteItem(p, "JavaScript Promises")).not.toBeVisible();
    await expect(noteItem(p, "TypeScript Generics")).not.toBeVisible();

    // Filter by "TypeScript"
    await searchInput.fill("TypeScript");
    await p.waitForTimeout(600);

    // Only TypeScript note should be visible
    await expect(noteItem(p, "TypeScript Generics")).toBeVisible();
    await expect(noteItem(p, "JavaScript Promises")).not.toBeVisible();
    await expect(noteItem(p, "Python Decorators")).not.toBeVisible();

    // Clear filter
    await searchInput.fill("");
    await p.waitForTimeout(600);

    // All notes should be visible again
    await expect(noteItem(p, "JavaScript Promises")).toBeVisible();
    await expect(noteItem(p, "Python Decorators")).toBeVisible();
    await expect(noteItem(p, "TypeScript Generics")).toBeVisible();
  });

  test("should add and remove a note from favorites", async ({ page: p }) => {
    await p.goto("/app/notes");

    // Create a note
    await newNoteBtn(p).click();
    await noteTA(p).fill("# Favorite Test Note\n\nThis note will be favorited");
    await saveBtn(p).click();
    await expect(noteItem(p, "Favorite Test Note")).toBeVisible();

    // Add to favorites
    await expect(favBtn(p)).toHaveAttribute("title", "Add to favorites");
    await favBtn(p).click();
    await expect(favBtn(p)).toHaveAttribute("title", "Remove from favorites");

    // Verify note appears in favorites page
    await p.goto("/app/fav");
    await expect(noteItem(p, "Favorite Test Note")).toBeVisible();

    // Remove from favorites
    await favBtn(p).click();
    await expect(favBtn(p)).toHaveAttribute("title", "Add to favorites");

    // Verify note is no longer in favorites page
    await p.goto("/app/fav");
    await expect(noteItem(p, "Favorite Test Note")).not.toBeVisible();
  });
});

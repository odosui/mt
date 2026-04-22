import { expect, test } from "@playwright/test";
import {
  createNote,
  flashcardsPanel,
  noteArea,
  noteItem,
} from "./helpers";

test.describe("Flashcards", () => {
  test("F3: open panel with empty state and toggle it", async ({ page: p }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Flashcard Note\n\nSome content");
    await expect(noteItem(p, "Flashcard Note")).toBeVisible();

    // Click the Flashcards toggler on the note (not the sidebar link)
    const toggler = noteArea(p).getByText("Flashcards", { exact: true }).first();
    await expect(toggler).toBeVisible();

    // Open panel — should show empty state
    await toggler.click();
    await expect(p.getByText("No flashcards yet.")).toBeVisible();

    // Close panel
    await toggler.click();
    await expect(p.getByText("No flashcards yet.")).not.toBeVisible();
  });

  test("F4: create a flashcard and see it in the list", async ({
    page: p,
  }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Card Note\n\nContent for flashcards");
    await expect(noteItem(p, "Card Note")).toBeVisible();

    // Open flashcards panel
    await noteArea(p).getByText("Flashcards", { exact: true }).click();
    await expect(p.getByText("No flashcards yet.")).toBeVisible();

    // Open form via "+" button in the panel heading
    await flashcardsPanel(p).getByRole("link").first().click();

    // Fill in the form
    await p.getByLabel("Question").fill("What is TypeScript?");
    await p.getByLabel("Answer").fill("A typed superset of JavaScript");
    await p.getByRole("button", { name: "Add card" }).click();

    // Card should appear in the list
    await expect(p.getByText("What is TypeScript?")).toBeVisible();
    // Empty state should be gone
    await expect(p.getByText("No flashcards yet.")).not.toBeVisible();
  });

  test("F4: create flashcards with Add Reversed", async ({ page: p }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Reverse Note\n\nContent for reversed cards");
    await expect(noteItem(p, "Reverse Note")).toBeVisible();

    await noteArea(p).getByText("Flashcards", { exact: true }).click();
    await flashcardsPanel(p).getByRole("link").first().click();

    // Check "Add Reversed" — button text should change to "Add cards"
    await p.getByLabel("Add Reversed").check();
    await expect(p.getByRole("button", { name: "Add cards" })).toBeVisible();

    await p.getByLabel("Question").fill("Capital of France");
    await p.getByLabel("Answer").fill("Paris");
    await p.getByRole("button", { name: "Add cards" }).click();

    // Both cards should appear (original + reversed = 2 cards)
    const cards = flashcardsPanel(p).locator(".flashcard");
    await expect(cards).toHaveCount(2);
  });
});

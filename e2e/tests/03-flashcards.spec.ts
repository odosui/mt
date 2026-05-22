import { expect, test } from "@playwright/test";
import { createNote, flashcardsPanel, noteArea, noteItem } from "./helpers";

test.describe("Flashcards", () => {
  test("F3: open panel with empty state and toggle it", async ({ page: p }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Flashcard Note\n\nSome content");
    await expect(noteItem(p, "Flashcard Note")).toBeVisible();

    // Click the Flashcards toggler on the note (not the sidebar link)
    const toggler = noteArea(p)
      .getByText("Flashcards", { exact: true })
      .first();
    await expect(toggler).toBeVisible();

    // Open panel — should show empty state
    await toggler.click();
    await expect(p.getByText("No flashcards yet.")).toBeVisible();

    // Close panel
    await toggler.click();
    await expect(p.getByText("No flashcards yet.")).not.toBeVisible();
  });

  test("F4: create a flashcard and see it in the list", async ({ page: p }) => {
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

  test("F12: GOOD shows next-interval and advances the queue", async ({
    page: p,
  }) => {
    await p.goto("/app/notes");
    await createNote(p, "# SR Note\n\nContent for spaced repetition");
    await expect(noteItem(p, "SR Note")).toBeVisible();

    // Create one flashcard
    await noteArea(p).getByText("Flashcards", { exact: true }).click();
    await flashcardsPanel(p).getByRole("link").first().click();
    await p.getByLabel("Question").fill("2 + 2");
    await p.getByLabel("Answer").fill("4");
    await p.getByRole("button", { name: "Add card" }).click();
    await expect(p.getByText("2 + 2")).toBeVisible();

    // Go to the review page
    await p.goto("/app/quiz");

    // Question is shown, count says "0 cards left" (only one due)
    await expect(p.locator(".review-card .question")).toHaveText("2 + 2");
    await expect(p.locator(".stats")).toHaveText("0 cards left");

    // Reveal the answer
    await p.getByRole("button", { name: "SHOW ANSWER" }).click();
    await expect(p.locator(".review-card .question")).toHaveText("4");

    // GOOD button advertises the level-2 interval (10m) for a brand new card
    const good = p.getByRole("button", { name: /GOOD/ });
    await expect(good).toContainText("10m");

    // Clicking GOOD advances the queue — no more cards due, fallback to explore mode
    await good.click();
    await expect(p.locator(".review-mode")).not.toBeVisible();
  });

  test("F10: clicking a flashcard flips it and shows the answer", async ({
    page: p,
  }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Flip Note\n\nContent for flip test");
    await expect(noteItem(p, "Flip Note")).toBeVisible();

    // Open flashcards panel and create a card
    await noteArea(p).getByText("Flashcards", { exact: true }).click();
    await flashcardsPanel(p).getByRole("link").first().click();

    const question = "What is React?";
    const answer = "A JavaScript library for building UIs";

    await p.getByLabel("Question").fill(question);
    await p.getByLabel("Answer").fill(answer);
    await p.getByRole("button", { name: "Add card" }).click();

    // Card should show the question on the front
    const card = flashcardsPanel(p).locator(".flashcard").first();
    await expect(card.locator(".card-view-question")).toHaveText(question);

    // Click the card to flip it
    await card.locator(".front").click();

    // The back (answer) should now be visible
    await expect(card.locator(".back")).toHaveText(answer);
  });
});

import { expect, test } from "@playwright/test";
import { createNote, noteArea, noteItem, quizzesPanel } from "./helpers";

function mockQuiz(noteId: string, title: string, numQuestions: number) {
  return {
    id: Date.now(),
    noteId,
    title,
    items: Array.from({ length: numQuestions }, (_, i) => ({
      question: `Question ${i + 1}?`,
      answers: ["Answer A", "Answer B", "Answer C", "Answer D"],
      correctIndex: 0,
    })),
    created_at: new Date().toISOString(),
    attempts: [],
  };
}

test.describe("Quizzes", () => {
  test("F1: open panel with empty state and toggle it", async ({ page: p }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Quiz Note\n\nSome content");
    await expect(noteItem(p, "Quiz Note")).toBeVisible();

    // Toggler should show "Quizzes" with no count badge
    const toggler = noteArea(p).getByText("Quizzes", { exact: true }).first();
    await expect(toggler).toBeVisible();

    // Open panel — should show empty state
    await toggler.click();
    await expect(p.getByText("No quizzes yet.")).toBeVisible();

    // Close panel
    await toggler.click();
    await expect(p.getByText("No quizzes yet.")).not.toBeVisible();
  });

  test("F2: generate quiz with mocked API, loading state, and list view", async ({
    page: p,
  }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Generate Note\n\nContent about testing");
    await expect(noteItem(p, "Generate Note")).toBeVisible();

    // Mock the generate endpoint with a small delay to observe loading
    await p.route("**/api/quizzes/generate", async (route) => {
      const body = route.request().postDataJSON();
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          mockQuiz(
            body.note_id,
            body.title,
            parseInt(body.number_of_questions, 10),
          ),
        ),
      });
    });

    const toggler = noteArea(p).getByText("Quizzes", { exact: true }).first();
    await toggler.click();
    await expect(p.getByText("No quizzes yet.")).toBeVisible();

    // Open form via "+" button
    await quizzesPanel(p).getByRole("link").first().click();

    await p.getByLabel("Title").fill("My E2E Quiz");
    await p.getByLabel("Text").fill("Text content for quiz generation.");
    await p.getByLabel("Number of questions").fill("5");

    const generateBtn = p.getByRole("button", { name: "Generate Quiz" });
    await generateBtn.click();

    // Loading state
    await expect(
      p.getByRole("button", { name: "Generating..." }),
    ).toBeDisabled();

    // After completion — back to list with new quiz
    await expect(p.getByText("My E2E Quiz")).toBeVisible({ timeout: 5000 });

    // Quiz should be listed with metadata
    await expect(quizzesPanel(p).getByText("5 questions")).toBeVisible();
  });

  test("F2: show error on generation failure", async ({ page: p }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Error Note\n\nContent for error test");
    await expect(noteItem(p, "Error Note")).toBeVisible();

    const toggler = noteArea(p).getByText("Quizzes", { exact: true }).first();
    await toggler.click();
    await quizzesPanel(p).getByRole("link").first().click();

    // Set up route mock before submitting
    await p.route("**/api/quizzes/generate", async (route) => {
      await route.abort("failed");
    });

    await p.getByLabel("Title").fill("Failing Quiz");
    await p.getByLabel("Text").fill("This will fail.");

    await p.getByRole("button", { name: "Generate Quiz" }).click();

    await expect(p.getByText("Failed to generate quiz")).toBeVisible();
  });
});

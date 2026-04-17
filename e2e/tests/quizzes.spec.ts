import { expect, Page, test } from "@playwright/test";
import { newNoteBtn, noteItem, noteTA, saveBtn } from "./helpers";

const quizzesToggler = (p: Page) => p.locator(".quizzes-toggler");
const quizzesPanel = (p: Page) => p.locator(".quizzes-panel");
const addQuizBtn = (p: Page) => quizzesPanel(p).locator(".action-btn").first();
const quizForm = (p: Page) => p.locator(".quiz-menu-form");
const quizTitle = (p: Page) => p.locator("#quiz-title");
const quizText = (p: Page) => p.locator("#quiz-text");
const quizNum = (p: Page) => p.locator("#quiz-num");
const generateBtn = (p: Page) => quizForm(p).locator('button[type="submit"]');
const quizListItem = (p: Page, title: string) =>
  p.locator(".quiz-list-item-title", { hasText: title });

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

async function createNote(p: Page, content: string) {
  await newNoteBtn(p).click();
  await noteTA(p).fill(content);
  await saveBtn(p).click();
}

test.describe("Quizzes", () => {
  test("F1: open panel with empty state and toggle it", async ({ page: p }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Quiz Note\n\nSome content");
    await expect(noteItem(p, "Quiz Note")).toBeVisible();

    // Button should not show count badge when there are no quizzes
    await expect(quizzesToggler(p)).toContainText("Quizzes");
    await expect(
      quizzesToggler(p).locator(".side-toggler-badge"),
    ).not.toBeVisible();

    // Open panel — should show empty state
    await quizzesToggler(p).click();
    await expect(quizzesPanel(p)).toBeVisible();
    await expect(quizzesPanel(p)).toContainText("No quizzes yet.");

    // Close panel
    await quizzesToggler(p).click();
    await expect(quizzesPanel(p)).not.toBeVisible();
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

    await quizzesToggler(p).click();
    await expect(quizzesPanel(p)).toContainText("No quizzes yet.");
    await addQuizBtn(p).click();

    await quizTitle(p).fill("My E2E Quiz");
    await quizText(p).fill("Text content for quiz generation.");
    await quizNum(p).fill("5");

    await generateBtn(p).click();

    // Loading state
    await expect(generateBtn(p)).toContainText("Generating...");
    await expect(generateBtn(p)).toBeDisabled();

    // After completion — back to list with new quiz
    await expect(quizListItem(p, "My E2E Quiz")).toBeVisible({ timeout: 5000 });
    await expect(quizForm(p)).not.toBeVisible();

    // Button should now show the quiz count badge
    await expect(
      quizzesToggler(p).locator(".side-toggler-badge"),
    ).toBeVisible();
    await expect(quizzesToggler(p).locator(".side-toggler-badge")).toHaveText(
      "1",
    );
  });

  test("F2: show error on generation failure", async ({ page: p }) => {
    await p.goto("/app/notes");
    await createNote(p, "# Error Note\n\nContent for error test");
    await expect(noteItem(p, "Error Note")).toBeVisible();

    await quizzesToggler(p).click();
    await addQuizBtn(p).click();

    // Set up route mock before submitting
    await p.route("**/api/quizzes/generate", async (route) => {
      await route.abort("failed");
    });

    await quizTitle(p).fill("Failing Quiz");
    await quizText(p).fill("This will fail.");

    await generateBtn(p).click();

    await expect(p.locator(".quiz-error")).toContainText(
      "Failed to generate quiz",
    );
  });
});

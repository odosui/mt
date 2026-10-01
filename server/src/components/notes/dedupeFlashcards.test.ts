import { describe, expect, it } from "vitest";
import { type Flashcard } from "./NotesStore.ts";
import { dedupeFlashcards } from "./dedupeFlashcards.ts";

function card(
  question: string,
  level: number,
  reviewed_at: string | null,
): Flashcard {
  return { note_id: "n1", question, answer: "a", level, reviewed_at };
}

describe("dedupeFlashcards", () => {
  it("keeps distinct questions in order", () => {
    const cards = [card("q1", 0, null), card("q2", 1, null)];
    expect(dedupeFlashcards(cards)).toEqual(cards);
  });

  it("keeps the most recently reviewed duplicate", () => {
    const older = card("q1", 5, "2026-01-01T00:00:00.000Z");
    const newer = card("q1", 0, "2026-02-01T00:00:00.000Z");
    expect(dedupeFlashcards([older, newer])).toEqual([newer]);
    expect(dedupeFlashcards([newer, older])).toEqual([newer]);
  });

  it("prefers a reviewed duplicate over a never-reviewed one", () => {
    const fresh = card("q1", 0, null);
    const reviewed = card("q1", 2, "2026-01-01T00:00:00.000Z");
    expect(dedupeFlashcards([fresh, reviewed])).toEqual([reviewed]);
  });

  it("keeps the first when neither duplicate was reviewed", () => {
    const first = card("q1", 0, null);
    const second = { ...card("q1", 0, null), answer: "other" };
    expect(dedupeFlashcards([first, second])).toEqual([first]);
  });
});

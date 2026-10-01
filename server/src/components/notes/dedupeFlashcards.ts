import { type Flashcard } from "./NotesStore.ts";

function reviewedAtTime(fc: Flashcard) {
  return fc.reviewed_at ? Date.parse(fc.reviewed_at) || 0 : 0;
}

// Flashcards are identified by their question, so duplicates (e.g. left by a
// bad merge) can't be reviewed independently. Keep the most recently reviewed.
export function dedupeFlashcards(flashcards: Flashcard[]): Flashcard[] {
  const byQuestion = new Map<string, Flashcard>();
  for (const fc of flashcards) {
    const existing = byQuestion.get(fc.question);
    if (!existing || reviewedAtTime(fc) > reviewedAtTime(existing)) {
      byQuestion.set(fc.question, fc);
    }
  }
  return [...byQuestion.values()];
}

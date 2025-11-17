import { NoteStore } from "../notes/NotesStore";
import {
  daysTillNextReview,
  daysTillReviewAfterCurrent,
  isReviewable,
} from "./utils";

const createQuestionsService = (noteStore: NoteStore) => {
  async function getReviewableQuestions() {
    const notes = await noteStore.getNotes("", false, false);
    const questions = notes.flatMap((note) => note.flashcards);
    return questions.filter((q) => isReviewable(q.level, q.reviewed_at));
  }

  async function getQuestions(id: string) {
    const note = await noteStore.getNote(id);
    if (!note) {
      throw new Error(`Note with id ${id} not found`);
    }

    return note.flashcards.map((fc) => ({
      question: fc.question,
      answer: fc.answer,
      level: fc.level,
      reviewed_at: fc.reviewed_at,
      days_till_review_after_current: daysTillReviewAfterCurrent(fc.level),
      days_till_next_review: daysTillNextReview(fc.level ?? 0, fc.reviewed_at),
    }));
  }

  return {
    getQuestions,
    getReviewableQuestions,
  };
};

export default createQuestionsService;

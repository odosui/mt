import { type Flashcard, type NoteStore } from "../notes/NotesStore.ts";
import {
  minutesTillNextReview,
  minutesTillReviewAfterCurrent,
  isReviewable,
  MAX_LEVEL,
} from "./utils.ts";
import dayjs from "dayjs";

const createQuestionsService = (noteStore: NoteStore) => {
  async function reviewGood(noteId: string, question: string) {
    const note = await noteStore.getNote(noteId);
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`);
    }

    const fc = note.flashcards.find((fc) => fc.question === question);
    if (!fc) {
      throw new Error(
        `Flashcard with question "${question}" not found in note ${noteId}`,
      );
    }

    fc.level += 1;
    fc.reviewed_at = dayjs().toISOString();
    await noteStore.updateNote(noteId, { flashcards: note.flashcards }, true);
  }

  async function reviewBad(noteId: string, question: string) {
    const note = await noteStore.getNote(noteId);
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`);
    }

    const fc = note.flashcards.find((fc) => fc.question === question);
    if (!fc) {
      throw new Error(
        `Flashcard with question "${question}" not found in note ${noteId}`,
      );
    }

    fc.level = 0;
    fc.reviewed_at = dayjs().toISOString();
    await noteStore.updateNote(noteId, { flashcards: note.flashcards }, true);
  }

  async function createQuestion(
    noteId: string,
    question: string,
    answer: string,
  ) {
    const note = await noteStore.getNote(noteId);
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`);
    }

    const fc: Flashcard = {
      note_id: noteId,
      question,
      answer,
      level: 0,
      reviewed_at: null,
    };

    note.flashcards.push(fc);

    await noteStore.updateNote(noteId, { flashcards: note.flashcards }, true);

    return asJson(fc, note.tags);
  }

  async function getReviewableQuestions() {
    const notes = await noteStore.getNotes("", false, false);
    return notes
      .flatMap((n) => n.flashcards.map((fc) => ({ fc, tags: n.tags })))
      .filter((q) => isReviewable(q.fc.level, q.fc.reviewed_at))
      .map((q) => asJson(q.fc, q.tags));
  }

  async function getAllQuestions() {
    const notes = await noteStore.getNotes("", false, false);
    const questions = notes.flatMap((note) =>
      note.flashcards.map((fc) => ({ fc, tags: note.tags })),
    );
    return questions.map((q) => asJson(q.fc, q.tags));
  }

  async function getQuestions(id: string) {
    const note = await noteStore.getNote(id);
    if (!note) {
      throw new Error(`Note with id ${id} not found`);
    }

    return note.flashcards.map((fc) => asJson(fc, note.tags));
  }

  async function updateQuestion(
    noteId: string,
    oldQuestion: string,
    newQuestion: string,
    newAnswer: string,
  ) {
    const note = await noteStore.getNote(noteId);
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`);
    }

    const fc = note.flashcards.find((fc) => fc.question === oldQuestion);
    if (!fc) {
      throw new Error(
        `Flashcard with question "${oldQuestion}" not found in note ${noteId}`,
      );
    }

    fc.question = newQuestion;
    fc.answer = newAnswer;
    await noteStore.updateNote(noteId, { flashcards: note.flashcards }, true);

    return asJson(fc, note.tags);
  }

  async function deleteQuestion(noteId: string, question: string) {
    const note = await noteStore.getNote(noteId);
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`);
    }

    const index = note.flashcards.findIndex((fc) => fc.question === question);
    if (index === -1) {
      throw new Error(
        `Flashcard with question "${question}" not found in note ${noteId}`,
      );
    }

    note.flashcards.splice(index, 1);
    await noteStore.updateNote(noteId, { flashcards: note.flashcards }, true);
  }

  return {
    getQuestions,
    getReviewableQuestions,
    createQuestion,
    reviewGood,
    reviewBad,
    getAllQuestions,
    updateQuestion,
    deleteQuestion,
  };
};

function asJson(fc: Flashcard, tags: string[] = []) {
  const completed = fc.level >= MAX_LEVEL;
  return {
    question: fc.question,
    answer: fc.answer,
    level: fc.level,
    reviewed_at: fc.reviewed_at,
    minutes_till_review_after_current: completed
      ? null
      : minutesTillReviewAfterCurrent(fc.level),
    minutes_till_next_review: completed
      ? null
      : minutesTillNextReview(fc.level ?? 0, fc.reviewed_at),
    completed,
    note_id: fc.note_id,
    tags,
  };
}

export default createQuestionsService;

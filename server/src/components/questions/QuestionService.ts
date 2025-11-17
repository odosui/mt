import { Flashcard, NoteStore } from "../notes/NotesStore";
import {
  daysTillNextReview,
  daysTillReviewAfterCurrent,
  isReviewable,
} from "./utils";
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
    await noteStore.updateNote(noteId, { flashcards: note.flashcards }, false);
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
    await noteStore.updateNote(noteId, { flashcards: note.flashcards }, false);
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

    await noteStore.updateNote(noteId, { flashcards: note.flashcards }, false);

    return asJson(fc);
  }

  async function getReviewableQuestions() {
    const notes = await noteStore.getNotes("", false, false);
    const questions = notes.flatMap((note) => note.flashcards);
    return questions
      .filter((q) => isReviewable(q.level, q.reviewed_at))
      .map(asJson);
  }

  async function getAllQuestions() {
    const notes = await noteStore.getNotes("", false, false);
    const questions = notes.flatMap((note) => note.flashcards);
    return questions.map(asJson);
  }

  async function getQuestions(id: string) {
    const note = await noteStore.getNote(id);
    if (!note) {
      throw new Error(`Note with id ${id} not found`);
    }

    return note.flashcards.map(asJson);
  }

  return {
    getQuestions,
    getReviewableQuestions,
    createQuestion,
    reviewGood,
    reviewBad,
    getAllQuestions,
  };
};

function asJson(fc: Flashcard) {
  return {
    question: fc.question,
    answer: fc.answer,
    level: fc.level,
    reviewed_at: fc.reviewed_at,
    days_till_review_after_current: daysTillReviewAfterCurrent(fc.level),
    days_till_next_review: daysTillNextReview(fc.level ?? 0, fc.reviewed_at),
    note_id: fc.note_id,
  };
}

export default createQuestionsService;

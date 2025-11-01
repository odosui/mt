import { NoteStore } from "../notes/NotesStore";
import { requresReview } from "./utils";

const createReviewService = (noteStore: NoteStore) => {
  const notes = noteStore.getNotes("", false);

  function reviewCounts() {
    const reviewCount = Object.values(notes).filter(requresReview).length;
    return { counts: { notes: reviewCount, questions: 0 } };
  }

  return {
    reviewCounts,
  };
};

export default createReviewService;

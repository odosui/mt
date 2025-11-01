import { NoteStore } from "../notes/NotesStore";
import { requresReview } from "./utils";

const createReviewService = (noteStore: NoteStore) => {
  async function reviewCounts() {
    const notes = await noteStore.getNotes("", false);
    const reviewCount = Object.values(notes).filter(requresReview).length;
    return { counts: { notes: reviewCount, questions: 0 } };
  }

  return {
    reviewCounts,
  };
};

export default createReviewService;

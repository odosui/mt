import dayjs from "dayjs";
import { NoteStore } from "../notes/NotesStore";
import { requresReview } from "./utils";

const createReviewService = (noteStore: NoteStore) => {
  async function reviewCounts() {
    const notes = await noteStore.getNotes("", false);
    const reviewCount = Object.values(notes).filter(requresReview).length;
    return { counts: { notes: reviewCount, questions: 0 } };
  }

  async function reviewNote(id: string) {
    const note = await noteStore.getNote(id);
    if (!note) {
      throw new Error(`Note with id ${id} not found`);
    }
    const n = await noteStore.updateNote(
      id,
      {
        level: (note.level || 0) + 1,
        last_reviewed_at: dayjs().format("YYYY-MM-DD"),
      },
      false,
    );
    return n;
  }

  return {
    reviewCounts,
    reviewNote,
  };
};

export default createReviewService;

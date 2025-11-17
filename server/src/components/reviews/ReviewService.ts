import dayjs from "dayjs";
import { NoteStore } from "../notes/NotesStore";

const createReviewService = (noteStore: NoteStore) => {
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
    reviewNote,
  };
};

export default createReviewService;

import { type NoteStore } from "../notes/NotesStore.ts";
import { type NoteRef, toNoteRef } from "./noteRef.ts";
import { extractLinkedNoteIds } from "./utils.ts";

export const createBacklinksService = (noteStore: NoteStore) => {
  async function getBacklinks(id: string): Promise<NoteRef[]> {
    const notes = await noteStore.getNotes("", false, false);
    return notes
      .filter((n) => n.id !== id && extractLinkedNoteIds(n.body).includes(id))
      .map(toNoteRef);
  }

  async function getAllRefs(): Promise<NoteRef[]> {
    const notes = await noteStore.getNotes("", false, false);
    return notes.map(toNoteRef);
  }

  return {
    getBacklinks,
    getAllRefs,
  };
};

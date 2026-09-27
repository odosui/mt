import { type Note } from "../notes/NotesStore.ts";
import { extractTitle } from "../notes/utils.ts";

export type NoteRef = {
  sid: number;
  title: string;
};

export function toNoteRef(n: Note): NoteRef {
  return { sid: parseInt(n.id, 10), title: extractTitle(n.body) };
}

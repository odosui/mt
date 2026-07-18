import { describe, expect, it } from "vitest";
import { createTagsService } from "./TagsService.ts";
import { Note, NoteStore } from "../notes/NotesStore.ts";

const n = (id: string, tags: string[]): Note => ({
  id,
  body: "",
  tags,
  level: 0,
  last_reviewed_at: "2024-01-01",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  favorite: false,
  flashcards: [],
});

const mockNoteStore = (notes: Note[]): NoteStore => ({
  noteCounts: async () => ({ total_notes: notes.length }),
  getNotes: async () => notes,
  getNote: async () => null,
  createNote: async () => notes[0]!,
  updateNote: async () => notes[0]!,
  deleteNote: async () => {},
});

describe("TagsService", () => {
  describe("allTags", () => {
    it("should count tags across notes", async () => {
      const store = mockNoteStore([
        n("1", ["js", "react"]),
        n("2", ["js", "vue"]),
      ]);
      const service = createTagsService(store);

      const tags = await service.allTags();

      expect(tags).toEqual([
        { id: "js", title: "js", count: 2 },
        { id: "react", title: "react", count: 1 },
        { id: "vue", title: "vue", count: 1 },
      ]);
    });

    it("should not count duplicate tags in the same note multiple times", async () => {
      const store = mockNoteStore([n("1", ["js", "js", "js"]), n("2", ["js"])]);
      const service = createTagsService(store);

      const tags = await service.allTags();

      expect(tags).toEqual([{ id: "js", title: "js", count: 2 }]);
    });

    it("should normalize tags to lowercase", async () => {
      const store = mockNoteStore([
        n("1", ["JavaScript"]),
        n("2", ["javascript"]),
      ]);
      const service = createTagsService(store);

      const tags = await service.allTags();

      expect(tags).toEqual([
        { id: "javascript", title: "javascript", count: 2 },
      ]);
    });
  });
});

import { describe, expect, it } from "vitest";
import { type Note, type NoteStore } from "../notes/NotesStore.ts";
import { createBacklinksService } from "./BacklinksService.ts";

const n = (id: string, body: string): Note => ({
  id,
  body,
  tags: [],
  favorite: false,
  pinned: false,
  flashcards: [],
  level: 0,
  last_reviewed_at: "",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  seo_title: "",
  seo_description: "",
  seo_published: false,
  seo_category: "",
  seo_slug: "",
});

const mockNoteStore = (notes: Note[]): NoteStore => ({
  noteCounts: async () => ({ total_notes: notes.length }),
  getNotes: async () => notes,
  getNote: async () => null,
  createNote: async () => notes[0]!,
  updateNote: async () => notes[0]!,
  deleteNote: async () => {},
});

describe("BacklinksService", () => {
  it("lists notes linking to the given note", async () => {
    const service = createBacklinksService(
      mockNoteStore([
        n("1", "# Target"),
        n("2", "# Source\n\nSee [target](1)"),
        n("3", "# Unrelated\n\nSee [other](2)"),
      ]),
    );

    expect(await service.getBacklinks("1")).toEqual([
      { sid: 2, title: "Source" },
    ]);
  });

  it("does not list a note linking to itself", async () => {
    const service = createBacklinksService(
      mockNoteStore([n("1", "# Self\n\n[me](1)")]),
    );

    expect(await service.getBacklinks("1")).toEqual([]);
  });

  it("does not confuse ids sharing a prefix", async () => {
    const service = createBacklinksService(
      mockNoteStore([n("1", "# One"), n("2", "# Two\n\n[x](12)")]),
    );

    expect(await service.getBacklinks("1")).toEqual([]);
  });
});

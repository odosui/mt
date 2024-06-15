import os from "os";
import path from "path";
import fs from "fs/promises";

class LocalEngine {
  #notes: Record<string, Note> = {};

  constructor() {}

  async init() {
    this.#notes = await readLocalNotes();
  }

  allTags(): Tag[] {
    return Object.values(this.#notes)
      .reduce((acc, n) => {
        n.tags.forEach((tag) => {
          const canTag = tag.trim().toLowerCase();

          const t = acc.find((t) => t.id === canTag);
          if (t) {
            t.count++;
          } else {
            acc.push({ id: canTag, title: canTag, count: 1 });
          }
        });

        return acc;
      }, [] as Tag[])
      .sort((a, b) => b.count - a.count);
  }

  noteCounts() {
    return { total_notes: Object.keys(this.#notes).length };
  }

  reviewCounts() {
    return { counts: { notes: 0, questions: 0 } };
  }

  notes() {
    // query, tags, is_review, fav_only, page, per_page
    return Object.values(this.#notes)
      .sort(compareByModifiedDateDesc)
      .map(noteListItem);
  }

  note(id: string) {
    const n = this.#notes[id];

    if (!n) {
      return null;
    }

    return {
      id: n.id,
      body: n.body,
      tags: n.tags,
      level: n.level,
      // updated_at : "2024-06-11T13:10:33.745Z"
      updated_at: n.updated_at,
      last_reviewed_at: n.last_reviewed_at,
      // created_at : "2024-06-11T13:00:02.396Z"
      created_at: n.created_at,
      favorite: false,
      needs_review: false,
      published: false,
      question_count: 0,
      seo_description: null,
      seo_title: null,
      seo_url: null,
      sid: parseInt(n.id, 10),
      slug: null,
      snippet: "",
      upcoming_reviews_in_days: [
        { level: 1, days_left: 6 },
        { level: 2, days_left: 15 },
        { level: 3, days_left: 30 },
      ],
      updated_at_in_words: "1 day",
    };
  }
}

export default LocalEngine;

async function readLocalNotes() {
  const notes: Record<string, Note> = {};

  // read notes
  const homeDir = os.homedir();
  const notesDir = path.join(homeDir, "mindthis");

  const files = await fs.readdir(notesDir);
  for (const file of files) {
    if (file && file.endsWith(".md")) {
      const id = file.split(".")[0];
      if (!id) {
        throw new Error("Invalid note id");
      }

      const filePath = path.join(notesDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      const [, metadata, body] = content.split("---");
      const mt: Record<string, string> = {};
      (metadata ?? "")
        .trim()
        .split("\n")
        .forEach((line) => {
          const [key, value] = line.split(":");
          if (key && value) {
            mt[key.trim()] = value.trim();
          }
        });

      const note: Note = {
        id,
        body: (body ?? "").trim(),
        tags: extractTags(body ?? ""),
        level: parseInt(mt.level ?? "0", 10),
        created_at: mt.created_at ?? "",
        updated_at: mt.updated_at ?? "",
        last_reviewed_at: mt.last_reviewed_at ?? "",
      };

      notes[id] = note;
    }
  }

  return notes;
}

function noteListItem(note: Note) {
  return {
    id: note.id,
    level: note.level,
    sid: parseInt(note.id, 10),
    snippet: note.body.split("\n").slice(0, 3).join("\n"),
    tags: note.tags,
    updated_at_in_words: "1 day",
  };
}

function compareByModifiedDateDesc(a: Note, b: Note) {
  return b.updated_at.localeCompare(a.updated_at);
}

type Tag = {
  id: string;
  title: string;
  count: number;
};

type Note = {
  id: string;
  body: string;
  tags: string[];
  level: number;
  created_at: string;
  updated_at: string;
  last_reviewed_at: string;
};

function extractTags(body: string): string[] {
  const tags: string[] = [];
  const lines = body.split("\n");
  for (const line of lines) {
    const words = line.split(" ");
    for (const w of words) {
      if (w.startsWith("#") && !w.startsWith("##")) {
        const t = w.slice(1).trim();
        if (t) {
          tags.push(t);
        }
      }
    }
  }

  return tags;
}

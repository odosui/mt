import dayjs from "dayjs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { requresReview } from "../reviews/utils";
import { Note, NoteStore } from "./NotesStore";

// read notes
const homeDir = os.homedir();
const notesDir = path.join(homeDir, "mt", "notes");

export async function createFSNotesStore(): Promise<NoteStore> {
  const notes: Record<string, Note> = await readNotes();

  async function noteCounts() {
    return { total_notes: Object.keys(notes).length };
  }

  async function getNotes(tags: string, isReview: boolean, favOnly: boolean) {
    // query, is_review, fav_only, page, per_page

    let res = Object.values(notes);

    // filter by tags
    const ts = tags ? tags.split(",").map((t) => t.trim().toLowerCase()) : "";
    res = res.filter((n) => {
      if (ts.length === 0) {
        return true;
      }

      return n.tags.some((t) => ts.includes(t.trim().toLowerCase()));
    });

    // review
    if (isReview) {
      res = res.filter(requresReview);
    }

    if (favOnly) {
      res = res.filter((n) => n.favorite);
    }

    return res.sort(compareByModifiedDateDesc);
  }

  async function getNote(id: string) {
    return notes[id] ?? null;
  }

  async function createNote(body: string) {
    const id = nextId(notes);
    const note: Note = {
      id,
      body,
      tags: extractTags(body),
      level: 0,
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
      last_reviewed_at: "",
      favorite: false,
    };

    await writeToDisk(note);

    notes[id] = note;

    return note;
  }

  async function updateNote(
    id: string,
    data: Partial<Note>,
    skipUpdatedAt = false,
  ) {
    delete data.id; // cannot update id
    const existingNote = notes[id];
    if (!existingNote) {
      throw new Error(`Note with id ${id} not found`);
    }

    const body = data.body ?? existingNote.body;
    const n: Note = {
      ...existingNote,
      ...data,
      body,
      tags: extractTags(body),
    };

    if (!skipUpdatedAt) {
      n.updated_at = dayjs().toISOString();
    }

    await writeToDisk(n);
    notes[id] = n;
    return n;
  }

  return {
    noteCounts,
    getNotes,
    getNote,
    createNote,
    updateNote,
  };
}

// create or update note on disk
async function writeToDisk(note: Note) {
  await fs.mkdir(notesDir, { recursive: true });

  const filePath = path.join(notesDir, `${note.id}.md`);
  const content = [
    `---`,
    `level: ${note.level}`,
    `created_at: ${note.created_at}`,
    `updated_at: ${note.updated_at}`,
    `last_reviewed_at: ${note.last_reviewed_at}`,
    `favorite: ${note.favorite}`,
    `---`,
    note.body,
  ].join("\n");

  // save file
  await fs.writeFile(filePath, content, "utf-8");
}

function nextId(notes: Record<string, Note>) {
  const maxId = Object.keys(notes).reduce((acc, id) => {
    const num = parseInt(id, 10);
    if (num > acc) {
      return num;
    }

    return acc;
  }, 0);

  return (maxId + 1).toString();
}

async function readNotes() {
  const notes: Record<string, Note> = {};

  const files = await fs.readdir(notesDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  for (const file of mdFiles) {
    const id = file.split(".")[0];
    if (!id) {
      throw new Error("Invalid note id");
    }

    const filePath = path.join(notesDir, file);
    const content = await fs.readFile(filePath, "utf-8");
    notes[id] = readNote(id, content);
  }

  return notes;
}

function readNote(id: string, content: string): Note {
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
    favorite: mt.favorite === "true",
  };

  return note;
}

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

function compareByModifiedDateDesc(a: Note, b: Note) {
  return b.updated_at.localeCompare(a.updated_at);
}

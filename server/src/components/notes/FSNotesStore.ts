import dayjs from "dayjs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { noSkipReviewByTag, requresReview } from "../reviews/utils";
import { Flashcard, Note, NoteStore } from "./NotesStore";
import { extractTitle, noteFilename } from "./utils";

function getDefaultMTHome() {
  const homeDir = os.homedir();
  return path.join(homeDir, "mt");
}

export async function createFSNotesStore(
  mtHomeArg: string,
): Promise<NoteStore> {
  const mtHome = mtHomeArg || getDefaultMTHome();
  const notesDir = path.join(mtHome, "notes");

  const notes: Record<string, Note> = await readNotes(notesDir);

  async function noteCounts() {
    return { total_notes: Object.keys(notes).length };
  }

  async function getNotes(
    tags: string,
    isReview: boolean,
    favOnly: boolean,
    query?: string,
  ) {
    let res = Object.values(notes);

    // filter by text query
    if (query && query.trim()) {
      const searchTerm = query.trim().toLowerCase();
      res = res.filter((n) => n.body.toLowerCase().includes(searchTerm));
    }

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
      res = res.filter(requresReview).filter(noSkipReviewByTag);
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
      flashcards: [],
      level: 0,
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
      last_reviewed_at: "",
      favorite: false,
    };

    await writeToDisk(notesDir, note);

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

    // Delete old file before writing (filename may change if title changed)
    const files = await fs.readdir(notesDir);
    const oldFile = files.find((f) => f.match(new RegExp(`^${id}(_|\\.)`)));
    if (oldFile) {
      await fs.unlink(path.join(notesDir, oldFile));
    }

    await writeToDisk(notesDir, n);
    notes[id] = n;
    return n;
  }

  async function deleteNote(id: string) {
    const existingNote = notes[id];
    if (!existingNote) {
      throw new Error(`Note with id ${id} not found`);
    }

    // Find and delete the file (filename includes title which may have changed)
    const files = await fs.readdir(notesDir);
    const noteFile = files.find((f) => f.match(new RegExp(`^${id}(_|\\.)`)));
    if (noteFile) {
      await fs.unlink(path.join(notesDir, noteFile));
    }

    delete notes[id];
  }

  return {
    noteCounts,
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
  };
}

// create or update note on disk
async function writeToDisk(notesDir: string, note: Note) {
  await fs.mkdir(notesDir, { recursive: true });

  const filePath = path.join(
    notesDir,
    noteFilename(note.id, extractTitle(note.body)),
  );

  const metadataLines = [
    `---`,
    `created_at: ${note.created_at}`,
    `updated_at: ${note.updated_at}`,
    `favorite: ${note.favorite}`,
    `last_reviewed_at: ${note.last_reviewed_at}`,
    `level: ${note.level}`,
  ];

  // Add flashcards to metadata
  for (const flashcard of note.flashcards) {
    metadataLines.push(
      `Q: ${JSON.stringify({
        question: flashcard.question,
        answer: flashcard.answer,
        level: flashcard.level,
        reviewed_at: flashcard.reviewed_at,
      })}`,
    );
  }

  metadataLines.push(`---`);
  metadataLines.push(note.body);

  const content = metadataLines.join("\n");

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

async function readNotes(notesDir: string) {
  const notes: Record<string, Note> = {};

  await fs.mkdir(notesDir, { recursive: true });
  const files = await fs.readdir(notesDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  for (const file of mdFiles) {
    const m = file.match(/^\d+/);
    if (!m) {
      console.warn(`Skipping file with invalid name: ${file}`);
      continue;
    }
    const id = m[0];
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
  // Split only on first two --- delimiters to handle --- in note body
  const parts = content.split("---");
  const metadata = parts[1] || "";
  const body = parts.slice(2).join("---");
  const mt: Record<string, string> = {};
  const flashcards: Flashcard[] = [];

  (metadata ?? "")
    .trim()
    .split("\n")
    .forEach((line) => {
      // Check if line is a flashcard
      if (line.trim().startsWith("Q: ")) {
        try {
          const jsonStr = line.trim().substring(3); // Remove "Q: " prefix
          const flashcard = {
            ...JSON.parse(jsonStr),
            note_id: id,
          };
          flashcards.push(flashcard);
        } catch (e) {
          console.error(`Failed to parse a flashcard: ${line}`, e);
        }
      } else {
        const [key, value] = line.split(":");
        if (key && value) {
          mt[key.trim()] = value.trim();
        }
      }
    });

  const note: Note = {
    id,
    body: (body ?? "").trim(),
    tags: extractTags(body ?? ""),
    flashcards: flashcards,
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

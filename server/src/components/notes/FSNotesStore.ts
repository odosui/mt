import dayjs from "dayjs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { noSkipReviewByTag, requresReview } from "../reviews/utils.ts";
import { type Flashcard, type Note, type NoteStore } from "./NotesStore.ts";
import { extractTitle, noteFilename } from "./utils.ts";

function getDefaultMTHome() {
  const homeDir = os.homedir();
  return path.join(homeDir, "mt");
}

export async function createFSNotesStore(
  mtHomeArg: string,
): Promise<NoteStore> {
  const mtHome = mtHomeArg || getDefaultMTHome();
  const notesDir = path.join(mtHome, "notes");

  async function readn() {
    const notes = await readNotes(notesDir);
    return notes;
  }

  async function noteCounts() {
    await fs.mkdir(notesDir, { recursive: true });
    const files = await fs.readdir(notesDir);
    const mdFiles = files.filter(
      (f) => f.endsWith(".md") && extractIdFromFilename(f),
    );
    return { total_notes: mdFiles.length };
  }

  async function getNotes(
    tags: string,
    isReview: boolean,
    favOnly: boolean,
    query?: string,
  ) {
    const notes = await readn();

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
    const files = await fs.readdir(notesDir);
    const noteFile = findNoteFile(files, id);
    if (!noteFile) {
      return null;
    }
    const filePath = path.join(notesDir, noteFile);
    const content = await fs.readFile(filePath, "utf-8");
    return readNote(id, content);
  }

  async function createNote(body: string) {
    const files = await fs.readdir(notesDir);

    // figuring out the next id
    const ids = files
      .map(extractIdFromFilename)
      .filter(Boolean)
      .map((id) => parseInt(id!, 10));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const id = (maxId + 1).toString();

    const n: Note = {
      id,
      body,
      tags: extractTags(body),
      flashcards: [],
      level: 0,
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
      last_reviewed_at: "",
      favorite: false,
      pinned: false,
      seo_title: "",
      seo_description: "",
      seo_published: false,
      seo_category: "",
      seo_slug: "",
    };

    await writeToDisk(notesDir, n);

    return n;
  }

  async function updateNote(
    id: string,
    data: Partial<Note>,
    skipUpdatedAt = false,
  ) {
    delete data.id; // cannot update id

    // Find existing note file
    const files = await fs.readdir(notesDir);
    const oldFile = findNoteFile(files, id);
    if (!oldFile) {
      throw new Error(`Note with id ${id} not found`);
    }

    const filePath = path.join(notesDir, oldFile);
    const content = await fs.readFile(filePath, "utf-8");
    const existingNote = readNote(id, content);

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
    await fs.unlink(filePath);

    await writeToDisk(notesDir, n);
    return n;
  }

  async function deleteNote(id: string) {
    const files = await fs.readdir(notesDir);
    const noteFile = findNoteFile(files, id);
    if (!noteFile) {
      throw new Error(`Note with id ${id} not found`);
    }

    await fs.unlink(path.join(notesDir, noteFile));
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
    `pinned: ${note.pinned}`,
    `last_reviewed_at: ${note.last_reviewed_at}`,
    `level: ${note.level}`,
    `seo_title: ${note.seo_title}`,
    `seo_description: ${note.seo_description}`,
    `seo_published: ${note.seo_published}`,
    `seo_category: ${note.seo_category}`,
    `seo_slug: ${note.seo_slug}`,
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

async function readNotes(notesDir: string) {
  const notes: Record<string, Note> = {};

  await fs.mkdir(notesDir, { recursive: true });
  const files = await fs.readdir(notesDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  for (const file of mdFiles) {
    const id = extractIdFromFilename(file);
    if (!id) {
      console.warn(`Skipping file with invalid name: ${file}`);
      continue;
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
        // splitting on the first colon
        const ind = line.indexOf(":");
        if (ind !== -1) {
          const key = line.slice(0, ind).trim();
          const value = line.slice(ind + 1).trim();
          if (key && value) {
            mt[key] = value;
          }
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
    pinned: mt.pinned === "true",
    seo_title: mt.seo_title ?? "",
    seo_description: mt.seo_description ?? "",
    seo_published: mt.seo_published === "true",
    seo_category: mt.seo_category ?? "",
    seo_slug: mt.seo_slug ?? "",
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

function findNoteFile(files: string[], id: string): string | undefined {
  return files.find((f) => f.match(new RegExp(`^${id}(_|\\.)`)));
}

function extractIdFromFilename(filename: string): string | undefined {
  return filename.match(/^(\d+)/)?.[1];
}

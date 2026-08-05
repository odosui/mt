import { watch, type FSWatcher } from "fs";
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

  await fs.mkdir(notesDir, { recursive: true });

  // In-memory cache of every note, keyed by id. Reads are served from here;
  // writes always go through disk first (see updateNote) so a stale entry can
  // never turn into a corrupted write.
  let cache: Map<string, Note> | null = null;

  // Ids whose file changed underneath us and needs re-reading.
  const dirty = new Set<string>();

  // Set when a file may have been added or removed, so the directory listing
  // itself has to be reconciled.
  let listStale = false;

  // Dedupes concurrent warm-ups: a cold start with N parallel requests scans
  // the corpus once, not N times.
  let loading: Promise<Map<string, Note>> | null = null;

  // When we cannot watch the directory we fall back to reading from disk on
  // every call - slower, but never stale.
  let watcher: FSWatcher | null = null;
  let watching = false;

  function onFileEvent(filename: string | null) {
    listStale = true;
    if (!filename) {
      // No filename means we cannot tell what moved - drop everything.
      cache = null;
      dirty.clear();
      return;
    }
    const id = extractIdFromFilename(filename);
    if (id) {
      dirty.add(id);
    }
  }

  function startWatching() {
    try {
      watcher = watch(notesDir, { persistent: false }, (_event, filename) => {
        onFileEvent(filename);
      });
      watcher.on("error", (e) => {
        console.warn(
          "mt: notes directory watcher failed, falling back to uncached reads",
          e,
        );
        watcher = null;
        watching = false;
      });
      watching = true;
    } catch (e) {
      console.warn(
        "mt: could not watch the notes directory, falling back to uncached reads",
        e,
      );
      watching = false;
    }
  }

  startWatching();

  // Bring `cache` up to date and return it.
  async function load(): Promise<Map<string, Note>> {
    // Without a watcher we have no way to learn about external edits, so the
    // cache is not trustworthy - rescan every time (the original behaviour).
    if (!watching) {
      cache = null;
      dirty.clear();
      listStale = false;
      return readNotes(notesDir);
    }

    if (cache && !listStale && dirty.size === 0) {
      return cache;
    }

    if (loading) {
      return loading;
    }

    loading = (async () => {
      try {
        // Take what we are about to handle and clear the flags *before*
        // awaiting. Anything the watcher reports while we are reading gets
        // re-flagged and picked up by the next load, instead of being wiped
        // by a clear at the end.
        const pending = new Set(dirty);
        const pendingListStale = listStale;
        for (const id of pending) {
          dirty.delete(id);
        }
        listStale = false;

        if (!cache) {
          cache = await readNotes(notesDir);
        } else {
          await reconcile(notesDir, cache, pending, pendingListStale);
        }
        return cache;
      } finally {
        loading = null;
      }
    })();

    return loading;
  }

  async function noteCounts() {
    const notes = await load();
    return { total_notes: notes.size };
  }

  async function getNotes(
    tags: string,
    isReview: boolean,
    favOnly: boolean,
    query?: string,
  ) {
    const notes = await load();

    let res = [...notes.values()];

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
    const notes = await load();
    return notes.get(id) ?? null;
  }

  async function createNote(body: string) {
    // Deliberately read the directory rather than the cache: allocating the
    // next id off a stale cache could hand out one that is already taken.
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
    cache?.set(id, n);

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

    // Always merge against what is actually on disk, never against the cache.
    // An external edit (a git pull, the user's editor) between our last read
    // and this write would otherwise be silently clobbered.
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
    cache?.set(id, n);
    return n;
  }

  async function deleteNote(id: string) {
    const files = await fs.readdir(notesDir);
    const noteFile = findNoteFile(files, id);
    if (!noteFile) {
      throw new Error(`Note with id ${id} not found`);
    }

    await fs.unlink(path.join(notesDir, noteFile));
    cache?.delete(id);
    dirty.delete(id);
  }

  function close() {
    watcher?.close();
    watcher = null;
    watching = false;
    cache = null;
  }

  return {
    noteCounts,
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    close,
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
  const notes = new Map<string, Note>();

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
    notes.set(id, readNote(id, content));
  }

  return notes;
}

// Bring an already-warm cache back in sync with disk by re-reading only what
// changed, rather than rescanning the whole corpus. `dirty` is a snapshot owned
// by the caller, not the live invalidation set.
async function reconcile(
  notesDir: string,
  cache: Map<string, Note>,
  dirty: Set<string>,
  listStale: boolean,
) {
  const files = await fs.readdir(notesDir);

  const filenameById = new Map<string, string>();
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const id = extractIdFromFilename(f);
    if (id) {
      filenameById.set(id, f);
    }
  }

  if (listStale) {
    // Files that disappeared (deleted, or renamed to a different id).
    for (const id of [...cache.keys()]) {
      if (!filenameById.has(id)) {
        cache.delete(id);
      }
    }
    // Files we have never seen before.
    for (const id of filenameById.keys()) {
      if (!cache.has(id)) {
        dirty.add(id);
      }
    }
  }

  for (const id of [...dirty]) {
    const file = filenameById.get(id);
    if (!file) {
      cache.delete(id);
      continue;
    }
    const content = await fs.readFile(path.join(notesDir, file), "utf-8");
    cache.set(id, readNote(id, content));
  }
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

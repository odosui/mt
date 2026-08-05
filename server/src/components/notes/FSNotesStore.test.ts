import { afterEach, describe, expect, it, vi } from "vitest";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { createFSNotesStore } from "./FSNotesStore.ts";
import { type NoteStore } from "./NotesStore.ts";

// ===============
// Helpers
// ===============

const stores: NoteStore[] = [];
const tmpDirs: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  while (stores.length) {
    stores.pop()?.close?.();
  }
  while (tmpDirs.length) {
    const dir = tmpDirs.pop();
    if (dir) await fs.rm(dir, { recursive: true, force: true });
  }
});

async function tmpHome() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mt-store-"));
  tmpDirs.push(dir);
  await fs.mkdir(path.join(dir, "notes"), { recursive: true });
  return dir;
}

async function newStore(mtHome: string) {
  const store = await createFSNotesStore(mtHome);
  stores.push(store);
  return store;
}

function noteFileContent(body: string, overrides: Record<string, string> = {}) {
  const meta: Record<string, string> = {
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    favorite: "false",
    pinned: "false",
    last_reviewed_at: "",
    level: "0",
    ...overrides,
  };
  const lines = Object.entries(meta).map(([k, v]) => `${k}: ${v}`);
  return ["---", ...lines, "---", body].join("\n");
}

// Writes a note file directly, simulating a git pull or an external editor.
async function writeExternally(mtHome: string, filename: string, body: string) {
  await fs.writeFile(
    path.join(mtHome, "notes", filename),
    noteFileContent(body),
    "utf-8",
  );
}

// fs.watch delivery is asynchronous and platform-dependent, so poll.
async function waitFor(check: () => Promise<boolean>, timeoutMs = 3000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await check()) return true;
    await new Promise((r) => setTimeout(r, 25));
  }
  return false;
}

// ===============
// Tests
// ===============

describe("FSNotesStore", () => {
  it("reads notes that already exist on disk", async () => {
    const home = await tmpHome();
    await writeExternally(home, "1_hello.md", "# Hello");
    await writeExternally(home, "2_world.md", "# World");

    const store = await newStore(home);

    expect(await store.noteCounts()).toEqual({ total_notes: 2 });
    expect((await store.getNote("1"))?.body).toBe("# Hello");
    expect((await store.getNote("2"))?.body).toBe("# World");
  });

  it("returns null for an unknown id", async () => {
    const store = await newStore(await tmpHome());
    expect(await store.getNote("999")).toBeNull();
  });

  it("reflects its own writes without waiting for the watcher", async () => {
    const store = await newStore(await tmpHome());

    const created = await store.createNote("# First");
    expect((await store.getNote(created.id))?.body).toBe("# First");
    expect(await store.noteCounts()).toEqual({ total_notes: 1 });

    await store.updateNote(created.id, { body: "# Edited" }, false);
    expect((await store.getNote(created.id))?.body).toBe("# Edited");

    const listed = await store.getNotes("", false, false);
    expect(listed.map((n) => n.body)).toEqual(["# Edited"]);

    await store.deleteNote(created.id);
    expect(await store.getNote(created.id)).toBeNull();
    expect(await store.noteCounts()).toEqual({ total_notes: 0 });
    expect(await store.getNotes("", false, false)).toEqual([]);
  });

  it("allocates ids that do not collide with files it has not cached", async () => {
    const home = await tmpHome();
    const store = await newStore(home);

    // Warm the cache while the directory is empty.
    expect(await store.noteCounts()).toEqual({ total_notes: 0 });

    // A note appears externally; the cache does not know about it yet.
    await writeExternally(home, "7_from_git.md", "# From git");

    const created = await store.createNote("# Mine");
    expect(created.id).toBe("8");

    // The external note is only visible once the watcher event lands, but the
    // id allocation above must account for it immediately either way.
    const seen = await waitFor(async () => {
      const n = await store.getNote("7");
      return n?.body === "# From git";
    });
    expect(seen).toBe(true);
  });

  it("picks up a note added externally", async () => {
    const home = await tmpHome();
    const store = await newStore(home);

    expect(await store.noteCounts()).toEqual({ total_notes: 0 });

    await writeExternally(home, "1_pulled.md", "# Pulled");

    const seen = await waitFor(async () => {
      const n = await store.getNote("1");
      return n?.body === "# Pulled";
    });
    expect(seen).toBe(true);
    expect(await store.noteCounts()).toEqual({ total_notes: 1 });
  });

  it("picks up a note edited externally", async () => {
    const home = await tmpHome();
    await writeExternally(home, "1_hello.md", "# Hello");
    const store = await newStore(home);

    expect((await store.getNote("1"))?.body).toBe("# Hello");

    await writeExternally(home, "1_hello.md", "# Changed by git");

    const seen = await waitFor(async () => {
      const n = await store.getNote("1");
      return n?.body === "# Changed by git";
    });
    expect(seen).toBe(true);
  });

  it("picks up a note removed externally", async () => {
    const home = await tmpHome();
    await writeExternally(home, "1_hello.md", "# Hello");
    const store = await newStore(home);

    expect((await store.getNote("1"))?.body).toBe("# Hello");

    await fs.rm(path.join(home, "notes", "1_hello.md"));

    const gone = await waitFor(async () => (await store.getNote("1")) === null);
    expect(gone).toBe(true);
    expect(await store.noteCounts()).toEqual({ total_notes: 0 });
  });

  // The reason writes re-read from disk instead of trusting the cache.
  it("does not clobber an external edit made after the cache was warmed", async () => {
    const home = await tmpHome();
    const store = await newStore(home);

    const created = await store.createNote("# Original");
    const filename = `${created.id}_original.md`;

    // Cache is warm and holds "# Original".
    expect((await store.getNote(created.id))?.body).toBe("# Original");

    // git pull rewrites the body. No watcher event has been processed yet.
    await writeExternally(home, filename, "# Original\n\nAdded on my phone");

    // A metadata-only write that does not touch the body at all.
    await store.updateNote(created.id, { favorite: true }, true);

    const onDisk = await fs.readFile(path.join(home, "notes", filename), "utf-8");
    expect(onDisk).toContain("Added on my phone");
    expect(onDisk).toContain("favorite: true");

    expect((await store.getNote(created.id))?.body).toContain(
      "Added on my phone",
    );
  });

  it("scans the corpus once when cold reads arrive concurrently", async () => {
    const home = await tmpHome();
    for (let i = 1; i <= 5; i++) {
      await writeExternally(home, `${i}_note.md`, `# Note ${i}`);
    }
    const store = await newStore(home);

    const readFile = vi.spyOn(fs, "readFile");

    await Promise.all([
      store.getNotes("", false, false),
      store.getNotes("", false, false),
      store.getNote("1"),
      store.noteCounts(),
    ]);

    // One pass over five notes, not four passes.
    expect(readFile).toHaveBeenCalledTimes(5);
  });

  it("serves repeat reads without touching the disk again", async () => {
    const home = await tmpHome();
    await writeExternally(home, "1_hello.md", "# Hello");
    const store = await newStore(home);

    await store.getNotes("", false, false);

    const readFile = vi.spyOn(fs, "readFile");
    await store.getNotes("", false, false);
    await store.getNote("1");
    await store.noteCounts();

    expect(readFile).not.toHaveBeenCalled();
  });

  // Invalidation flags are cleared before the read, not after, so a change
  // landing mid-reconcile is not silently dropped.
  it("does not lose a change that arrives while a read is in flight", async () => {
    const home = await tmpHome();
    await writeExternally(home, "1_one.md", "# One");
    const store = await newStore(home);

    // Warm the cache.
    await store.getNotes("", false, false);

    // Simulate the file changing *after* the store has read it but before the
    // read finishes: the third write's watcher event lands mid-flight, so it
    // must survive whatever flag bookkeeping the read does.
    let firstRead = true;
    const real = fs.readFile.bind(fs);
    vi.spyOn(fs, "readFile").mockImplementation(async (...args: never[]) => {
      const result = await real(...(args as Parameters<typeof real>));
      if (firstRead) {
        firstRead = false;
        await writeExternally(home, "1_one.md", "# Three");
        await new Promise((r) => setTimeout(r, 150));
      }
      return result;
    });

    await writeExternally(home, "1_one.md", "# Two");

    // The in-flight read caches the now-stale "# Two".
    const sawStale = await waitFor(async () => {
      const n = await store.getNote("1");
      return n?.body === "# Two";
    });
    expect(sawStale).toBe(true);

    vi.restoreAllMocks();

    const settled = await waitFor(async () => {
      const n = await store.getNote("1");
      return n?.body === "# Three";
    });
    expect(settled).toBe(true);
  });

  it("still filters and sorts correctly off the cache", async () => {
    const home = await tmpHome();
    const store = await newStore(home);

    const a = await store.createNote("# Alpha\n\n#work");
    const b = await store.createNote("# Beta\n\n#home");
    await store.updateNote(b.id, { favorite: true }, true);

    const work = await store.getNotes("work", false, false);
    expect(work.map((n) => n.id)).toEqual([a.id]);

    const favs = await store.getNotes("", false, true);
    expect(favs.map((n) => n.id)).toEqual([b.id]);

    const matches = await store.getNotes("", false, false, "Alpha");
    expect(matches.map((n) => n.id)).toEqual([a.id]);

    const all = await store.getNotes("", false, false);
    expect(all).toHaveLength(2);
  });
});

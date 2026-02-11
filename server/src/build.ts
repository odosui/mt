import fs from "fs/promises";
import { marked } from "marked";
import path from "path";
import { createFSNotesStore } from "./components/notes/FSNotesStore";
import { Note } from "./components/notes/NotesStore";
import { extractTitle, snakeCased } from "./components/notes/utils";

const TEMPLATES_DIR = path.join(__dirname, "templates");

const GEN_EXTS = new Set([
  ".html",
  ".css",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
]);

async function loadLayoutTemplate(): Promise<string> {
  return fs.readFile(path.join(TEMPLATES_DIR, "layout.html"), "utf-8");
}

function slugFor(note: Note): string {
  return note.seo_slug || snakeCased(extractTitle(note.body));
}

function titleFor(note: Note): string {
  return note.seo_title || extractTitle(note.body);
}

export async function buildStaticSite(mtHome: string, outputDir: string) {
  const mediaDir = path.join(mtHome, "media");
  const outDir = path.resolve(outputDir);
  const layoutTemplate = await loadLayoutTemplate();

  // Read all notes and filter to seo_published
  const store = await createFSNotesStore(mtHome);
  const allNotes = await store.getNotes("", false, false);
  const published = allNotes
    .filter((n) => n.seo_published)
    .sort((a, b) => Number(a.id) - Number(b.id));

  if (published.length === 0) {
    console.log("No notes with seo_published: true found.");
    return;
  }

  // Build a lookup: note id -> slug (for link rewriting)
  const idToSlug: Record<string, string> = {};
  for (const note of published) {
    idToSlug[note.id] = slugFor(note);
  }

  // Clean generated files without deleting the entire directory
  await fs.mkdir(outDir, { recursive: true });
  const existing = await fs.readdir(outDir);
  for (const file of existing) {
    const ext = path.extname(file).toLowerCase();
    if (GEN_EXTS.has(ext)) {
      await fs.rm(path.join(outDir, file), { force: true });
    }
  }
  // Clean media subdirectory
  const outMedia = path.join(outDir, "media");
  try {
    await fs.rm(outMedia, { recursive: true, force: true });
  } catch {}

  // Generate pages
  for (const note of published) {
    const slug = slugFor(note);
    const html = renderNotePage(note, published, idToSlug, layoutTemplate);
    await fs.writeFile(path.join(outDir, `${slug}.html`), html, "utf-8");
    console.log(`  ${slug}.html`);
  }

  // Generate index page
  const indexHtml = renderIndexPage(published, layoutTemplate);
  await fs.writeFile(path.join(outDir, "index.html"), indexHtml, "utf-8");
  console.log("  index.html");

  // Copy stylesheet and media for published notes
  await fs.copyFile(
    path.join(TEMPLATES_DIR, "style.css"),
    path.join(outDir, "style.css"),
  );
  await copyMedia(mediaDir, outDir, published);

  console.log(`\nStatic site built to ${outDir}/ (${published.length} pages)`);
}

// --- Markdown conversion with link/image rewriting ---

function convertMarkdown(
  body: string,
  idToSlug: Record<string, string>,
): string {
  // Skip absolute URLs (http/https)
  let processed = body.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, alt, src) => {
      if (src.startsWith("http://") || src.startsWith("https://")) {
        return `![${alt}](${src})`;
      }
      return `![${alt}](media/${src})`;
    },
  );

  // Rewrite inter-note links: [text](digits) -> [text](slug.html) or plain text
  processed = processed.replace(
    /\[([^\]]+)\]\((\d+)\)/g,
    (_match, text, id) => {
      const slug = idToSlug[id];
      if (slug) {
        return `[${text}](${slug}.html)`;
      }
      return text; // unpublished note: render as plain text
    },
  );

  return marked.parse(processed, { async: false }) as string;
}

// --- HTML templates ---

function sidebarHtml(pages: Note[], currentSlug?: string): string {
  const grouped: Record<string, Note[]> = {};
  for (const p of pages) {
    const cat = p.seo_category || "uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  let html = "";
  for (const [category, notes] of Object.entries(grouped)) {
    html += `<h4>${escapeHtml(category)}</h4>\n<ul>\n`;
    for (const note of notes) {
      const slug = slugFor(note);
      const isCurrent = slug === currentSlug;
      const cls = isCurrent ? ' class="current"' : "";
      html += `  <li><a href="${slug}.html"${cls}>${escapeHtml(titleFor(note))}</a></li>\n`;
    }
    html += `</ul>\n`;
  }
  return html;
}

function pageLayout(
  title: string,
  content: string,
  pages: Note[],
  layoutTemplate: string,
  currentSlug?: string,
  description?: string,
): string {
  const sidebar = sidebarHtml(pages, currentSlug);
  const metaDesc = description
    ? `<meta name="description" content="${escapeAttr(description)}">`
    : "";

  return layoutTemplate
    .replace("{{title}}", escapeHtml(title))
    .replace("{{metaDesc}}", metaDesc)
    .replace("{{sidebar}}", sidebar)
    .replace("{{content}}", content);
}

function renderNotePage(
  note: Note,
  allPages: Note[],
  idToSlug: Record<string, string>,
  layoutTemplate: string,
): string {
  const htmlContent = convertMarkdown(note.body, idToSlug);
  return pageLayout(
    titleFor(note),
    htmlContent,
    allPages,
    layoutTemplate,
    slugFor(note),
    note.seo_description,
  );
}

function renderIndexPage(pages: Note[], layoutTemplate: string): string {
  const grouped: Record<string, Note[]> = {};
  for (const p of pages) {
    const cat = p.seo_category || "uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  let content = `<h1>mt's docs pages</h1>\n`;
  for (const [category, notes] of Object.entries(grouped)) {
    content += `<h2>${escapeHtml(category)}</h2>\n`;
    for (const note of notes) {
      const slug = slugFor(note);
      content += `<article class="index-card">\n`;
      content += `  <h3><a href="${slug}.html">${escapeHtml(titleFor(note))}</a></h3>\n`;
      if (note.seo_description) {
        content += `  <p>${escapeHtml(note.seo_description)}</p>\n`;
      }
      content += `</article>\n`;
    }
  }

  return pageLayout("Home", content, pages, layoutTemplate);
}

// --- Media copy ---

async function copyMedia(mediaDir: string, outDir: string, published: Note[]) {
  let exists = true;
  try {
    await fs.access(mediaDir);
  } catch {
    exists = false;
  }
  if (!exists) return;

  const outMedia = path.join(outDir, "media");
  await fs.mkdir(outMedia, { recursive: true });

  const allFiles = await fs.readdir(mediaDir);
  const publishedIds = new Set(published.map((n) => n.id));

  let copied = 0;
  for (const file of allFiles) {
    const match = file.match(/^(\d+)__/);
    if (!match || !match[1]) continue;
    if (!publishedIds.has(match[1])) continue;

    await fs.copyFile(path.join(mediaDir, file), path.join(outMedia, file));
    copied++;
  }

  if (copied > 0) {
    console.log(`  Copied ${copied} media file(s)`);
  }
}

// --- Helpers ---

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/&/g, "&amp;");
}

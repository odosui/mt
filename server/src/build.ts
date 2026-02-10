import fs from "fs/promises";
import path from "path";
import { marked } from "marked";
import { extractTitle } from "./components/notes/utils";

interface SeoNote {
  id: string;
  body: string;
  seo_title: string;
  seo_description: string;
  seo_category: string;
  slug: string;
}

const TEMPLATES_DIR = path.join(__dirname, "templates");

async function loadLayoutTemplate(): Promise<string> {
  return fs.readFile(path.join(TEMPLATES_DIR, "layout.html"), "utf-8");
}

export async function buildStaticSite(mtHome: string, outputDir: string) {
  const notesDir = path.join(mtHome, "notes");
  const mediaDir = path.join(mtHome, "media");
  const outDir = path.resolve(outputDir);
  const layoutTemplate = await loadLayoutTemplate();

  // Read all notes and filter to seo_published
  const files = await fs.readdir(notesDir);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const published: SeoNote[] = [];

  for (const file of mdFiles) {
    const id = file.match(/^(\d+)/)?.[1];
    if (!id) continue;

    const content = await fs.readFile(path.join(notesDir, file), "utf-8");
    const { meta, body } = parseFrontmatter(content);

    if (meta.seo_published !== "true") continue;

    const title = meta.seo_title || extractTitle(body);
    const slug = file.replace(/\.md$/, "").replace(/^\d+_/, "");
    published.push({
      id,
      body,
      seo_title: title,
      seo_description: meta.seo_description || "",
      seo_category: meta.seo_category || "uncategorized",
      slug,
    });
  }

  if (published.length === 0) {
    console.log("No notes with seo_published: true found.");
    return;
  }

  // Build a lookup: note id -> slug (for link rewriting)
  const idToSlug: Record<string, string> = {};
  for (const note of published) {
    idToSlug[note.id] = note.slug;
  }

  // Prepare output directory
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  // Generate pages
  for (const note of published) {
    const html = renderNotePage(note, published, idToSlug, layoutTemplate);
    await fs.writeFile(path.join(outDir, `${note.slug}.html`), html, "utf-8");
    console.log(`  ${note.slug}.html`);
  }

  // Generate index page
  const indexHtml = renderIndexPage(published, layoutTemplate);
  await fs.writeFile(path.join(outDir, "index.html"), indexHtml, "utf-8");
  console.log("  index.html");

  // Copy stylesheet and media for published notes
  await fs.copyFile(path.join(TEMPLATES_DIR, "style.css"), path.join(outDir, "style.css"));
  await copyMedia(mediaDir, outDir, published);

  console.log(`\nStatic site built to ${outDir}/ (${published.length} pages)`);
}

// --- Frontmatter parser ---

function parseFrontmatter(content: string): {
  meta: Record<string, string>;
  body: string;
} {
  const parts = content.split("---");
  const metaRaw = parts[1] || "";
  const body = parts.slice(2).join("---").trim();
  const meta: Record<string, string> = {};

  for (const line of metaRaw.trim().split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.substring(0, idx).trim();
    const value = line.substring(idx + 1).trim();
    if (key) meta[key] = value;
  }

  return { meta, body };
}

// --- Markdown conversion with link/image rewriting ---

function convertMarkdown(
  body: string,
  noteId: string,
  idToSlug: Record<string, string>,
): string {
  // Rewrite image paths: ![alt](file.png) -> ![alt](media/{noteId}__file.png)
  // Skip absolute URLs (http/https)
  let processed = body.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, alt, src) => {
      if (src.startsWith("http://") || src.startsWith("https://")) {
        return `![${alt}](${src})`;
      }
      return `![${alt}](media/${noteId}__${src})`;
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

function sidebarHtml(pages: SeoNote[], currentSlug?: string): string {
  const grouped: Record<string, SeoNote[]> = {};
  for (const p of pages) {
    const cat = p.seo_category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  let html = "";
  for (const [category, notes] of Object.entries(grouped)) {
    html += `<h4>${escapeHtml(category)}</h4>\n<ul>\n`;
    for (const note of notes) {
      const isCurrent = note.slug === currentSlug;
      const cls = isCurrent ? ' class="current"' : "";
      html += `  <li><a href="${note.slug}.html"${cls}>${escapeHtml(note.seo_title)}</a></li>\n`;
    }
    html += `</ul>\n`;
  }
  return html;
}

function pageLayout(
  title: string,
  content: string,
  pages: SeoNote[],
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
  note: SeoNote,
  allPages: SeoNote[],
  idToSlug: Record<string, string>,
  layoutTemplate: string,
): string {
  const htmlContent = convertMarkdown(note.body, note.id, idToSlug);
  return pageLayout(
    note.seo_title,
    htmlContent,
    allPages,
    layoutTemplate,
    note.slug,
    note.seo_description,
  );
}

function renderIndexPage(pages: SeoNote[], layoutTemplate: string): string {
  const grouped: Record<string, SeoNote[]> = {};
  for (const p of pages) {
    const cat = p.seo_category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  let content = `<h1>Pages</h1>\n`;
  for (const [category, notes] of Object.entries(grouped)) {
    content += `<h2>${escapeHtml(category)}</h2>\n`;
    for (const note of notes) {
      content += `<article class="index-card">\n`;
      content += `  <h3><a href="${note.slug}.html">${escapeHtml(note.seo_title)}</a></h3>\n`;
      if (note.seo_description) {
        content += `  <p>${escapeHtml(note.seo_description)}</p>\n`;
      }
      content += `</article>\n`;
    }
  }

  return pageLayout("Home", content, pages, layoutTemplate);
}

// --- Media copy ---

async function copyMedia(
  mediaDir: string,
  outDir: string,
  published: SeoNote[],
) {
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

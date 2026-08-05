import fs from "fs/promises";
import { marked } from "marked";
import path from "path";
import { createFSNotesStore } from "./components/notes/FSNotesStore.ts";
import { type Note } from "./components/notes/NotesStore.ts";
import { extractTitle, snakeCased } from "./components/notes/utils.ts";

const TEMPLATES_DIR = path.join(import.meta.dirname, "templates");

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

async function loadButtondownForm(
  handle: string,
  title: string,
): Promise<string> {
  const template = await fs.readFile(
    path.join(TEMPLATES_DIR, "buttondown-form.html"),
    "utf-8",
  );
  return template
    .replace(/\{\{handle\}\}/g, escapeAttr(handle))
    .replace(/\{\{title\}\}/g, escapeHtml(title));
}

function slugFor(note: Note): string {
  return note.seo_slug || snakeCased(extractTitle(note.body));
}

function titleFor(note: Note): string {
  return note.seo_title || extractTitle(note.body);
}

async function loadSettings(
  mtHome: string,
): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(path.join(mtHome, "settings.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function googleAnalyticsSnippet(measurementId: string): string {
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeAttr(measurementId)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeAttr(measurementId)}');</script>`;
}

export async function buildStaticSite(mtHome: string, outputDir: string) {
  const mediaDir = path.join(mtHome, "media");
  const outDir = path.resolve(outputDir);
  const settings = await loadSettings(mtHome);
  const layoutTemplate = await loadLayoutTemplate();

  // Read all notes and filter to seo_published
  const store = await createFSNotesStore(mtHome);
  const allNotes = await store.getNotes("", false, false);
  store.close?.(); // one-shot command, no need to keep watching
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
  const existing = await fs.readdir(outDir, { withFileTypes: true });
  for (const entry of existing) {
    const fullPath = path.join(outDir, entry.name);
    if (entry.isDirectory()) {
      // Remove slug directories and media
      await fs.rm(fullPath, { recursive: true, force: true });
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (GEN_EXTS.has(ext)) {
        await fs.rm(fullPath, { force: true });
      }
    }
  }

  const analytics = settings.google_analytics_id
    ? googleAnalyticsSnippet(settings.google_analytics_id)
    : "";

  const buttondownForm = settings.buttondown_handle
    ? await loadButtondownForm(
        settings.buttondown_handle,
        settings.buttondown_title || "Get new posts in your inbox",
      )
    : "";

  // Generate pages
  for (const note of published) {
    const slug = slugFor(note);
    const html = renderNotePage(
      note,
      published,
      idToSlug,
      layoutTemplate,
      analytics,
      buttondownForm,
    );
    const pageDir = path.join(outDir, slug);
    await fs.mkdir(pageDir, { recursive: true });
    await fs.writeFile(path.join(pageDir, "index.html"), html, "utf-8");
    console.log(`  ${slug}/index.html`);
  }

  // Generate index page
  const indexHtml = renderIndexPage(published, layoutTemplate, analytics);
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

function renderSoundCloudEmbed(code: string): string {
  const meta = Object.fromEntries(
    code.split("\n").map((p: string) => {
      const [key, value] = p.split(":");
      return [key, value?.trim() || ""];
    }),
  );
  const { track_id, track_name, track_title, user } = meta;

  if (!track_id || !user) {
    return `<div class="code-error">SoundCloud embed error: missing track_id or user</div>`;
  }

  return `<div class="soundcloud" style="background-color: #222; border-radius: 4px; padding: 8px;">
<div class="soundcloud-embed">
<iframe width="100%" height="20" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${track_id}&color=%23ff5500&inverse=true&auto_play=false&show_user=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/${user}" title="YT" target="_blank" style="color: #cccccc; text-decoration: none;">YT</a> · <a href="https://soundcloud.com/${user}/${track_name}" title="${escapeAttr(track_title)}" target="_blank" style="color: #cccccc; text-decoration: none;">${escapeHtml(track_title)}</a></div>
</div>
</div>`;
}

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
      return `![${alt}](/media/${src})`;
    },
  );

  // Rewrite inter-note links: [text](digits) -> [text](slug.html) or plain text
  processed = processed.replace(
    /\[([^\]]+)\]\((\d+)\)/g,
    (_match, text, id) => {
      const slug = idToSlug[id];
      if (slug) {
        return `[${text}](/${slug}/)`;
      }
      return text; // unpublished note: render as plain text
    },
  );

  const renderer = new marked.Renderer();
  const defaultCode = renderer.code.bind(renderer);
  renderer.code = function (token) {
    if (token.lang === "soundcloud") {
      return renderSoundCloudEmbed(token.text);
    }
    return defaultCode(token);
  };

  return marked.parse(processed, { async: false, renderer }) as string;
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
      html += `  <li><a href="/${slug}/"${cls}>${escapeHtml(titleFor(note))}</a></li>\n`;
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
  analytics?: string,
): string {
  const sidebar = sidebarHtml(pages, currentSlug);
  const metaDesc = description
    ? `<meta name="description" content="${escapeAttr(description)}">`
    : "";

  return layoutTemplate
    .replace("{{title}}", escapeHtml(title))
    .replace("{{metaDesc}}", metaDesc)
    .replace("{{analytics}}", analytics || "")
    .replace("{{sidebar}}", sidebar)
    .replace("{{content}}", content);
}

function renderNotePage(
  note: Note,
  allPages: Note[],
  idToSlug: Record<string, string>,
  layoutTemplate: string,
  analytics: string,
  buttondownForm: string,
): string {
  const htmlContent = convertMarkdown(note.body, idToSlug);
  const contentWithFooter =
    htmlContent +
    (buttondownForm ? `\n${buttondownForm}\n` : "") +
    `\n<footer class="mt-footer">Built with <a href="https://github.com/odosui/mt/">mt</a></footer>\n`;
  return pageLayout(
    titleFor(note),
    contentWithFooter,
    allPages,
    layoutTemplate,
    slugFor(note),
    note.seo_description,
    analytics,
  );
}

function renderIndexPage(pages: Note[], layoutTemplate: string, analytics: string): string {
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
      content += `  <h3><a href="/${slug}/">${escapeHtml(titleFor(note))}</a></h3>\n`;
      if (note.seo_description) {
        content += `  <p>${escapeHtml(note.seo_description)}</p>\n`;
      }
      content += `</article>\n`;
    }
  }

  return pageLayout("Home", content, pages, layoutTemplate, undefined, undefined, analytics);
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

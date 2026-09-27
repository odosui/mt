export function extractTitle(body: string): string {
  const lines = body.split("\n");

  return (
    lines.find((l) => l.trim().length > 0)?.replace(/^#+\s*/, "") || "Untitled"
  );
}

export function snakeCased(str: string): string {
  if (!str) {
    return str;
  }

  return str
    .toLowerCase()
    .replace(/[\s\-]+/gu, "_") // Replace spaces and hyphens with underscores
    .replace(/[^\p{L}\p{N}_]+/gu, "_") // Replace non-letter, non-number chars with underscores
    .replace(/_+/g, "_") // Collapse multiple underscores
    .replace(/^_|_$/g, ""); // Remove leading/trailing underscores
}

export function noteFilename(sid: string, title: string | null): string {
  const titlePart = title ? snakeCased(title) : null;
  const name = [sid, titlePart].filter(Boolean).join("_");
  return `${name}.md`;
}

// Plain text: the client escapes it and highlights the query itself.
export function extractSnippetWithContext(
  body: string,
  query?: string,
  contextChars = 100,
): string {
  const searchTerm = query?.trim().toLowerCase() ?? "";
  const matchStart = searchTerm ? body.toLowerCase().indexOf(searchTerm) : -1;
  if (matchStart === -1) {
    return firstLines(body, 3);
  }

  const matchEnd = matchStart + searchTerm.length;
  let start = Math.max(0, matchStart - contextChars);
  let end = Math.min(body.length, matchEnd + contextChars);

  // Trim partial words at the edges, but never into the match itself.
  if (start > 0) {
    const space = body.indexOf(" ", start);
    if (space !== -1 && space < matchStart) start = space + 1;
  }
  if (end < body.length) {
    const space = body.lastIndexOf(" ", end);
    if (space >= matchEnd) end = space;
  }

  const prefix = start > 0 ? "..." : "";
  const suffix = end < body.length ? "..." : "";
  return prefix + body.slice(start, end) + suffix;
}

function firstLines(body: string, count: number): string {
  return body.split("\n").slice(0, count).join("\n");
}

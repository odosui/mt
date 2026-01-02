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

export function extractSnippetWithContext(
  body: string,
  query?: string,
  contextChars = 100,
): string {
  if (!query || !query.trim()) {
    // No query - return first 3 lines as before
    return body ? body.split("\n").slice(0, 3).join("\n") : "";
  }

  const searchTerm = query.trim().toLowerCase();
  const bodyLower = body.toLowerCase();
  const matchIndex = bodyLower.indexOf(searchTerm);

  if (matchIndex === -1) {
    // No match found (shouldn't happen if filtered correctly)
    return body ? body.split("\n").slice(0, 3).join("\n") : "";
  }

  // Calculate start and end positions for context
  const start = Math.max(0, matchIndex - contextChars);
  const end = Math.min(
    body.length,
    matchIndex + searchTerm.length + contextChars,
  );

  // Extract the snippet with context
  let snippet = body.substring(start, end);

  // Calculate where the match is within the snippet
  const matchStart = matchIndex - start;
  const matchEnd = matchStart + searchTerm.length;

  // Wrap the matched text with <mark> tags
  const before = snippet.substring(0, matchStart);
  const match = snippet.substring(matchStart, matchEnd);
  const after = snippet.substring(matchEnd);
  snippet = before + "<mark>" + match + "</mark>" + after;

  // Add ellipsis if we're not at the boundaries
  if (start > 0) {
    // Find the start of the first complete word
    const firstSpace = snippet.indexOf(" ");
    if (firstSpace !== -1) {
      snippet = "..." + snippet.substring(firstSpace + 1);
    }
  }

  if (end < body.length) {
    // Find the end of the last complete word
    const lastSpace = snippet.lastIndexOf(" ");
    if (lastSpace !== -1) {
      snippet = snippet.substring(0, lastSpace) + "...";
    }
  }

  return snippet;
}

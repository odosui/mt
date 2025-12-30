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

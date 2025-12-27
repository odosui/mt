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
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function noteFilename(sid: string, title: string | null): string {
  const titlePart = title ? snakeCased(title) : null;
  const name = [sid, titlePart].filter(Boolean).join("_");

  return `${name}.md`;
}

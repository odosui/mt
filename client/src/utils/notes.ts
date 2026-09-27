// Up to three leading lines of a snippet, blank ones dropped.
export function snippetLines(snippet: string): string[] {
  return snippet
    .trim()
    .split('\n')
    .slice(0, 3)
    .filter((line) => line.trim())
}

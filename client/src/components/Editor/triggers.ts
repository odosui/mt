export type Trigger = {
  kind: 'tag' | 'noteLink'
  query: string
  // index where the trigger ("#" or "[[") starts
  start: number
}

export function detectTrigger(text: string, cursorPos: number): Trigger | null {
  const before = text.substring(0, cursorPos)
  return detectNoteLink(before) ?? detectTag(before)
}

function detectNoteLink(before: string): Trigger | null {
  const start = before.lastIndexOf('[[')
  if (start === -1) return null

  const query = before.substring(start + 2)
  if (/[[\]\n]/.test(query)) return null

  return { kind: 'noteLink', query, start }
}

function detectTag(before: string): Trigger | null {
  const start = before.lastIndexOf('#')
  if (start === -1) return null

  // The '#' must be at the start of the text or preceded by whitespace —
  // this filters out URL fragments (foo.com#bar), preprocessor directives
  // (#include), and other in-word '#' characters.
  if (start > 0) {
    const prev = before[start - 1]
    if (prev && !/\s/.test(prev)) return null
  }

  const query = before.substring(start + 1)
  // A space after '#' means it's a markdown heading, not a tag.
  if (query.includes(' ') || query.includes('\n')) return null

  return { kind: 'tag', query, start }
}

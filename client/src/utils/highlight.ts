export type TextPart = { text: string; isMatch: boolean }

export function splitByTerm(text: string, term: string): TextPart[] {
  const trimmed = term.trim()
  if (!trimmed) {
    return [{ text, isMatch: false }]
  }

  // Splitting on a capture group puts the matches at the odd indices.
  return text
    .split(new RegExp(`(${escapeRegExp(trimmed)})`, 'gi'))
    .map((part, i) => ({ text: part, isMatch: i % 2 === 1 }))
    .filter((part) => part.text)
}

export function hasMatch(text: string, term: string) {
  return splitByTerm(text, term).some((part) => part.isMatch)
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

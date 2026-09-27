import { NoteRef } from '../types'

const MAX_RESULTS = 10

function matches(ref: NoteRef, words: string[]) {
  const title = ref.title.toLowerCase()
  const sid = String(ref.sid)
  return words.every((w) => title.includes(w) || sid.startsWith(w))
}

export function filterNoteRefs(
  refs: NoteRef[],
  query: string,
  excludeSid: number,
): NoteRef[] {
  const q = query.trim().toLowerCase()
  const words = q.split(/\s+/).filter(Boolean)
  const found = refs.filter((r) => r.sid !== excludeSid && matches(r, words))
  const exactId = found.filter((r) => String(r.sid) === q)
  const rest = found.filter((r) => String(r.sid) !== q)
  return [...exactId, ...rest].slice(0, MAX_RESULTS)
}

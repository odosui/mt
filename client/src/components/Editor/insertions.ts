import { NoteRef } from '../../types'

export type Inserted = { text: string; cursor: number }

function replaceRange(
  text: string,
  start: number,
  end: number,
  insert: string,
): Inserted {
  return {
    text: text.substring(0, start) + insert + text.substring(end),
    cursor: start + insert.length,
  }
}

export function insertTag(
  text: string,
  start: number,
  end: number,
  tag: string,
): Inserted {
  return replaceRange(text, start, end, `#${tag} `)
}

export function insertNoteLink(
  text: string,
  start: number,
  end: number,
  ref: NoteRef,
): Inserted {
  const title = ref.title.replace(/[[\]]/g, '')
  return replaceRange(text, start, end, `[${title}](${ref.sid})`)
}

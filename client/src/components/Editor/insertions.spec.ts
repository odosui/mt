import { describe, expect, it } from 'vitest'
import { insertNoteLink, insertTag } from './insertions'

describe('insertNoteLink', () => {
  it('replaces the typed query with a markdown link', () => {
    const text = 'See [[alp and more'
    expect(
      insertNoteLink(text, 4, 9, { sid: 7, title: 'Alpha' }),
    ).toEqual({ text: 'See [Alpha](7) and more', cursor: 14 })
  })

  it('drops brackets from the title', () => {
    expect(
      insertNoteLink('[[', 0, 2, { sid: 1, title: 'Arrays [draft]' }).text,
    ).toBe('[Arrays draft](1)')
  })
})

describe('insertTag', () => {
  it('replaces the typed query with the tag and a space', () => {
    expect(insertTag('a #ja b', 2, 5, 'javascript')).toEqual({
      text: 'a #javascript  b',
      cursor: 14,
    })
  })
})

import { describe, expect, it } from 'vitest'
import { filterNoteRefs } from './noteRefs'

const refs = [
  { sid: 1, title: 'Linking Target Alpha' },
  { sid: 2, title: 'Linking Decoy Delta' },
  { sid: 12, title: 'Chapter 1 summary' },
  { sid: 3, title: 'Current note' },
]

describe('filterNoteRefs', () => {
  it('returns everything but the excluded note for an empty query', () => {
    expect(filterNoteRefs(refs, '', 3).map((r) => r.sid)).toEqual([1, 2, 12])
  })

  it('matches every word against the title, case-insensitively', () => {
    expect(filterNoteRefs(refs, 'linking ALP', 3).map((r) => r.sid)).toEqual([
      1,
    ])
  })

  it('matches by id prefix and puts the exact id first', () => {
    expect(filterNoteRefs(refs, '1', 3).map((r) => r.sid)).toEqual([1, 12])
    expect(filterNoteRefs(refs, '12', 3).map((r) => r.sid)).toEqual([12])
  })

  it('never offers the excluded note', () => {
    expect(filterNoteRefs(refs, 'current', 3)).toEqual([])
  })

  it('caps the number of results', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      sid: i + 100,
      title: `Note ${i}`,
    }))
    expect(filterNoteRefs(many, 'note', 0)).toHaveLength(10)
  })
})

import { describe, expect, it } from 'vitest'
import { snippetLines } from './notes'

describe('snippetLines', () => {
  it('keeps the first three lines without blanks', () => {
    expect(snippetLines('# Title\n\nBody\nMore')).toEqual(['# Title', 'Body'])
  })

  it('returns nothing for an empty snippet', () => {
    expect(snippetLines('  \n ')).toEqual([])
  })
})

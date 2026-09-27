import { describe, expect, it } from 'vitest'
import { hasMatch, splitByTerm } from './highlight'

describe('splitByTerm', () => {
  it('returns the whole text when the term is empty', () => {
    expect(splitByTerm('hello', '  ')).toEqual([
      { text: 'hello', isMatch: false },
    ])
  })

  it('marks every case-insensitive match', () => {
    expect(splitByTerm('Go go GO!', 'go')).toEqual([
      { text: 'Go', isMatch: true },
      { text: ' ', isMatch: false },
      { text: 'go', isMatch: true },
      { text: ' ', isMatch: false },
      { text: 'GO', isMatch: true },
      { text: '!', isMatch: false },
    ])
  })

  it('treats regex characters in the term literally', () => {
    expect(splitByTerm('C++ and (a|b)', '(a|b)')).toEqual([
      { text: 'C++ and ', isMatch: false },
      { text: '(a|b)', isMatch: true },
    ])
    expect(() => splitByTerm('text', '(')).not.toThrow()
    expect(() => splitByTerm('text', '[')).not.toThrow()
  })
})

describe('hasMatch', () => {
  it('detects matches', () => {
    expect(hasMatch('Learning Python', 'python')).toBe(true)
    expect(hasMatch('Learning Python', 'rust')).toBe(false)
    expect(hasMatch('Learning Python', '')).toBe(false)
  })
})

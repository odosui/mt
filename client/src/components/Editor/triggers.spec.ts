import { describe, expect, it } from 'vitest'
import { detectTrigger } from './triggers'

const at = (text: string) => detectTrigger(text, text.length)

describe('detectTrigger', () => {
  it('detects a note link being typed', () => {
    expect(at('See [[linking alp')).toEqual({
      kind: 'noteLink',
      query: 'linking alp',
      start: 4,
    })
  })

  it('detects an empty note link query', () => {
    expect(at('[[')).toEqual({ kind: 'noteLink', query: '', start: 0 })
  })

  it('ignores a closed or broken note link', () => {
    expect(at('[[done]] ')).toBeNull()
    expect(at('[[multi\nline')).toBeNull()
  })

  it('detects a tag being typed', () => {
    expect(at('text #jav')).toEqual({ kind: 'tag', query: 'jav', start: 5 })
  })

  it('ignores headings and in-word hashes', () => {
    expect(at('# Heading')).toBeNull()
    expect(at('foo.com#bar')).toBeNull()
  })

  it('only looks at text before the cursor', () => {
    expect(detectTrigger('[[abc', 1)).toBeNull()
  })
})

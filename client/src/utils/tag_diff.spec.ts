import tagDiff from './tag_diff'

import { describe, expect, it } from 'vitest'

describe('tagDiff', () => {
  it.concurrent('works', () => {
    expect(tagDiff([], [])).toEqual({})
    expect(tagDiff(['test'], [])).toEqual({ test: -1 })
    expect(tagDiff(['test'], ['test'])).toEqual({})
    expect(tagDiff(['one', 'two'], ['one', 'three'])).toEqual({
      two: -1,
      three: 1,
    })
    expect(tagDiff(['one', 'two'], [])).toEqual({ one: -1, two: -1 })
  })
})

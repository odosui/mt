import { describe, it, expect } from 'vitest'
import {
  compact,
  flatten,
  groupBy,
  range,
  sortBy,
  toPairs,
  uniq,
  values,
  wrapArray,
  uniqBy
} from './collections'

describe.concurrent('uniq', () => {
  it('removes duplicates', async () => {
    expect(uniq([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
  })

  it('removes duplicates from strings', async () => {
    expect(uniq(['a', 'b', 'b', 'c', 'c', 'c'])).toEqual(['a', 'b', 'c'])
  })
})

describe.concurrent('sortBy', () => {
  it('sorts by string', async () => {
    const items = [{ title: 'c' }, { title: 'a' }, { title: 'b' }]
    expect(sortBy(items, (i) => i.title)).toEqual([
      { title: 'a' },
      { title: 'b' },
      { title: 'c' },
    ])
  })

  it('sorts by numeric value', async () => {
    const a = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const b = sortBy(a, (i) => i.id)
    expect(b).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
  })
})

describe.concurrent('flatten', () => {
  it('flattens an array of arrays', async () => {
    expect(
      flatten([
        [1, 2],
        [3, 4],
      ]),
    ).toEqual([1, 2, 3, 4])
  })
})

describe.concurrent('wrapArray', () => {
  it('wraps a value in an array', async () => {
    expect(wrapArray(1)).toEqual([1])
  })

  it('returns an array if passed an array', async () => {
    expect(wrapArray([1])).toEqual([1])
  })
})

describe.concurrent('toPairs', () => {
  it('converts an object to an array of pairs', async () => {
    expect(toPairs({ a: 1, b: 2 })).toEqual([
      ['a', 1],
      ['b', 2],
    ])
  })
})

describe.concurrent('groupBy', () => {
  it('groups by string', async () => {
    const items = [
      { title: 'a', author: 'a' },
      { title: 'b', author: 'a' },
      { title: 'c', author: 'b' },
    ]
    expect(groupBy(items, (i) => i.author)).toEqual({
      a: [
        { title: 'a', author: 'a' },
        { title: 'b', author: 'a' },
      ],
      b: [{ title: 'c', author: 'b' }],
    })
  })

  it('groups by numeric value', async () => {
    const items = [
      { title: 'a', id: 1 },
      { title: 'b', id: 1 },
      { title: 'c', id: 2 },
    ]
    expect(groupBy(items, (i) => i.id)).toEqual({
      1: [
        { title: 'a', id: 1 },
        { title: 'b', id: 1 },
      ],
      2: [{ title: 'c', id: 2 }],
    })
  })
})

describe.concurrent('values', async () => {
  it('returns the values of an object', () => {
    expect(values({ a: 1, b: 2 })).toEqual([1, 2])
  })
})

describe.concurrent('range', async () => {
  it('returns an array of numbers', async () => {
    expect(range(3)).toEqual([0, 1, 2])
  })

  it('works given two arguments', async () => {
    expect(range(1, 4)).toEqual([1, 2, 3])
  })
})

describe.concurrent('compact', () => {
  it('removes null values', async () => {
    expect(compact([1, null, 2])).toEqual([1, 2])
  })

  it('leaves falsy values', async () => {
    expect(compact([0, '', false])).toEqual([0, '', false])
  })
})

describe.concurrent('uniqBy', () => {
  it('removes duplicates', async () => {
    expect(
      uniqBy(
        [
          { id: 1, title: 'a' },
          { id: 1, title: 'b' },
          { id: 2, title: 'c' },
        ],
        (i) => `${i.id}` ,
      ),
    ).toEqual([
      { id: 1, title: 'a' },
      { id: 2, title: 'c' },
    ])
  })

  it('removes duplicate by multiple fields', async () => {
    expect(
      uniqBy(
        [
          { id: 1, title: 'a' },
          { id: 1, title: 'b' },
          { id: 2, title: 'c' },
        ],
        (i) => `${i.id}${i.title}` ,
      ),
    ).toEqual([
      { id: 1, title: 'a' },
      { id: 1, title: 'b' },
      { id: 2, title: 'c' },
    ])
  })


})

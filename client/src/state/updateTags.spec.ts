import { updateTags } from './StateProvider'
import { ITag } from '../types'

import { describe, expect, it } from 'vitest'

describe('updateTags', () => {
  it('decrements tag counts when note is deleted (oldTags present, newTags empty)', () => {
    const tags: ITag[] = [
      { name: 'javascript', title: 'javascript', count: 5 },
      { name: 'react', title: 'react', count: 3 },
      { name: 'typescript', title: 'typescript', count: 2 },
    ]

    const result = updateTags(tags, ['javascript', 'react'], [])

    expect(result).toEqual([
      { name: 'javascript', title: 'javascript', count: 4 },
      { name: 'react', title: 'react', count: 2 },
      { name: 'typescript', title: 'typescript', count: 2 },
    ])
  })

  it('removes tags when count reaches zero', () => {
    const tags: ITag[] = [
      { name: 'javascript', title: 'javascript', count: 1 },
      { name: 'react', title: 'react', count: 3 },
    ]

    const result = updateTags(tags, ['javascript'], [])

    expect(result).toEqual([{ name: 'react', title: 'react', count: 3 }])
  })

  it('removes multiple tags when their counts reach zero', () => {
    const tags: ITag[] = [
      { name: 'javascript', title: 'javascript', count: 1 },
      { name: 'react', title: 'react', count: 1 },
      { name: 'typescript', title: 'typescript', count: 5 },
    ]

    const result = updateTags(tags, ['javascript', 'react'], [])

    expect(result).toEqual([
      { name: 'typescript', title: 'typescript', count: 5 },
    ])
  })

  it('increments tag counts when tags are added', () => {
    const tags: ITag[] = [{ name: 'javascript', title: 'javascript', count: 5 }]

    const result = updateTags(tags, [], ['javascript', 'react'])

    expect(result).toEqual([
      { name: 'javascript', title: 'javascript', count: 6 },
      { name: 'react', title: 'react', count: 1 },
    ])
  })

  it('adds new tags that did not exist before', () => {
    const tags: ITag[] = [{ name: 'javascript', title: 'javascript', count: 5 }]

    const result = updateTags(tags, [], ['python'])

    expect(result).toEqual([
      { name: 'javascript', title: 'javascript', count: 5 },
      { name: 'python', title: 'python', count: 1 },
    ])
  })

  it('handles mixed add and remove operations', () => {
    const tags: ITag[] = [
      { name: 'javascript', title: 'javascript', count: 5 },
      { name: 'react', title: 'react', count: 3 },
    ]

    const result = updateTags(tags, ['react'], ['typescript'])

    expect(result).toEqual([
      { name: 'javascript', title: 'javascript', count: 5 },
      { name: 'react', title: 'react', count: 2 },
      { name: 'typescript', title: 'typescript', count: 1 },
    ])
  })

  it('returns empty array when all tags are removed', () => {
    const tags: ITag[] = [{ name: 'javascript', title: 'javascript', count: 1 }]

    const result = updateTags(tags, ['javascript'], [])

    expect(result).toEqual([])
  })

  it('sorts tags by count in descending order', () => {
    const tags: ITag[] = [
      { name: 'javascript', title: 'javascript', count: 2 },
      { name: 'react', title: 'react', count: 5 },
    ]

    const result = updateTags(tags, [], ['javascript'])

    expect(result).toEqual([
      { name: 'react', title: 'react', count: 5 },
      { name: 'javascript', title: 'javascript', count: 3 },
    ])
  })
})

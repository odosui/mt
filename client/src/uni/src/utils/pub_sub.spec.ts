import { describe, it, expect, vi } from 'vitest'
import PubSub from './pub_sub'

describe('PubSub', () => {
  it('should publish events', () => {
    const pubSub = PubSub<{
      foo: () => void
      bar: () => void
    }>()

    const foo = vi.fn()
    const bar = vi.fn()

    pubSub.on('foo', foo)
    pubSub.on('bar', bar)

    pubSub.publish('foo')
    pubSub.publish('bar')

    expect(foo).toHaveBeenCalledTimes(1)
    expect(bar).toHaveBeenCalledTimes(1)
  })

  it('should unsubscribe from events', () => {
    const pubSub = PubSub<{
      foo: () => void
    }>()

    const foo = vi.fn()

    pubSub.on('foo', foo)

    pubSub.publish('foo')
    pubSub.off('foo', foo)
    pubSub.publish('foo')

    expect(foo).toHaveBeenCalledTimes(1)
  })

  it('should not fail when unsubscribing from non-existing events', () => {
    const pubSub = PubSub<{
      foo: () => void
    }>()
    const foo = vi.fn()
    pubSub.off('foo', foo)
    expect(foo).toHaveBeenCalledTimes(0)
  })

  it('allows calling function with parameters', () => {
    const pubSub = PubSub<{
      foo: () => void
      bar: (id: number, name: string) => void
    }>()
    const bar = vi.fn()
    pubSub.on('bar', bar)
    pubSub.publish('bar', 1, 'foo')
    expect(bar).toHaveBeenCalledWith(1, 'foo')

    // @ts-expect-error - should not allow calling with wrong parameters
    pubSub.publish('foo', 1, 'foo')
  })
})

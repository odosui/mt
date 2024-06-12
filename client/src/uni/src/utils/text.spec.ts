import { describe, it, expect } from 'vitest'
import { crop, numerize } from './text'

describe('crop', () => {
  it('should crop text', () => {
    expect(crop('hello world', 5)).toBe('he...')
  })

  it('should not crop text', () => {
    expect(crop('hello world', 20)).toBe('hello world')
  })

  it('ignore empty text', () => {
    expect(crop('', 20)).toBe('')
  })
})

describe('numerize', () => {
  it('should numerize singular', () => {
    expect(numerize(1, 'apple', 'apples')).toBe('1 apple')
  })

  it('should numerize plural', () => {
    expect(numerize(2, 'apple', 'apples')).toBe('2 apples')
  })
})

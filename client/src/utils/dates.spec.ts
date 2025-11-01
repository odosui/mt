import { describe, it, expect } from 'vitest'
import { diffInDays } from './dates'

describe('diffInDays', () => {
  it("should return 0 for today's date", () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // Get current date in YYYY-MM-DD format
    expect(diffInDays(todayStr)).toBe(0)
  })

  it("should return 1 for yesterday's date", () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    expect(diffInDays(yesterdayStr)).toBe(1)
  })

  it('should return 10 for a date 10 days ago', () => {
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)
    const tenDaysAgoStr = tenDaysAgo.toISOString().split('T')[0]
    expect(diffInDays(tenDaysAgoStr)).toBe(10)
  })

  it("should return -1 for tomorrow's date", () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    expect(diffInDays(tomorrowStr)).toBe(-1)
  })
})

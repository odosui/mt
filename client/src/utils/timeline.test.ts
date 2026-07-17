import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { groupTimeline } from './timeline'
import { TimelineItem } from '../types'

const items: TimelineItem[] = [
  {
    date: '2026-03-15',
    content: 'mar: 18:00 **movie** Project Hail Mary',
    note_sid: 555,
    note_title: 'Rom W 2026',
    color: 'pink',
  },
  {
    date: '2026-04-01',
    content: '09:00 Dermatologie',
    note_sid: 502,
    note_title: 'Personal Timeline',
    color: 'cyan',
  },
  {
    date: '2026-04-01',
    content:
      '[Artemis II](https://en.wikipedia.org/wiki/Artemis_II) (astronauts around the Moon)',
    note_sid: 484,
    note_title: 'Space timeline',
    color: 'blue',
  },
  {
    date: '2026-04-03',
    content: "**Christopher's** vacation till 04-19",
    note_sid: 502,
    note_title: 'Personal Timeline',
    color: 'cyan',
  },
  {
    date: '2026-04-03',
    content: 'The Super Mario Galaxy Movie / Illumination',
    note_sid: 485,
    note_title: 'Movies/TV timeline',
    color: 'green',
  },
  {
    date: '2026-04-03',
    content: 'The Drama / A24, Zendaya, Pattinson',
    note_sid: 485,
    note_title: 'Movies/TV timeline',
    color: 'green',
  },
  {
    date: '2026-04-05',
    content: 'Приезжают родители',
    note_sid: 502,
    note_title: 'Personal Timeline',
    color: 'cyan',
  },
  {
    date: '2026-04-07',
    content:
      'Starship [Launch 12](https://en.wikipedia.org/wiki/List_of_Starship_launches#Future_launches) (Block 3)',
    note_sid: 484,
    note_title: 'Space timeline',
    color: 'blue',
  },
  {
    date: '2026-04-08',
    content:
      '[SMILE](https://en.wikipedia.org/wiki/SMILE_(spacecraft)) - ESA & China attempt to monitor sun wind, lunched by **Vega-C**',
    note_sid: 484,
    note_title: 'Space timeline',
    color: 'blue',
  },
  {
    date: '2026-04-23',
    content: "Stranger Things: Tales from '85",
    note_sid: 485,
    note_title: 'Movies/TV timeline',
    color: 'green',
  },
  {
    date: '2026-04-24',
    content: 'Pragmata / Capcom',
    note_sid: 487,
    note_title: 'Games timeline',
    color: 'orange',
  },
  {
    date: '2026-04-25',
    content: "**Sofia's** vacation till 05-10",
    note_sid: 502,
    note_title: 'Personal Timeline',
    color: 'cyan',
  },
  {
    date: '2026-04',
    content: 'apr: theatre ???',
    note_sid: 555,
    note_title: 'Rom W 2026',
    color: 'pink',
  },
  {
    date: '2026-05-02',
    content: '19:00 Баллет',
    note_sid: 502,
    note_title: 'Personal Timeline',
    color: 'cyan',
  },
  {
    date: '2026-05-08',
    content: 'Mortal Kombat II',
    note_sid: 485,
    note_title: 'Movies/TV timeline',
    color: 'green',
  },
]

describe('groupTimeline', () => {
  beforeEach(() => {
    // Today is 2026-03-12 (Thursday)
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function findGroup(key: string) {
    return groupTimeline(items).find((g) => g.key === key)
  }

  it('returns only non-empty groups, in display order', () => {
    const groups = groupTimeline(items)
    expect(groups.map((g) => g.key)).toEqual([
      'this-week',
      'next-month',
      'second-next-month',
    ])
  })

  it('accounts for every item across all groups', () => {
    const groups = groupTimeline(items)
    const total = groups.reduce((sum, g) => sum + g.events.length, 0)
    expect(total).toBe(items.length)
  })

  it('should have no passed or today events', () => {
    expect(findGroup('passed')).toBeUndefined()
    expect(findGroup('today')).toBeUndefined()
  })

  it('should place 2026-03-15 in this week', () => {
    // 2026-03-12 is Thursday, 2026-03-15 is Sunday — same week (Mon-Sun)
    const group = findGroup('this-week')
    expect(group?.title).toBe('This Week')
    expect(group?.events).toHaveLength(1)
    expect(group?.events[0]?.date).toBe('2026-03-15')
    expect(group?.events[0]?.content).toContain('Project Hail Mary')
  })

  it('should place all April events in next month', () => {
    const group = findGroup('next-month')
    expect(group?.title).toBe('Next Month (April)')
    // 11 specific 2026-04-XX dates + the partial 2026-04 date
    expect(group?.events).toHaveLength(12)
    expect(group?.events.every((e) => e.date.startsWith('2026-04'))).toBe(true)
  })

  it('should place May events in second next month', () => {
    const group = findGroup('second-next-month')
    expect(group?.title).toBe('May 2026')
    expect(group?.events).toHaveLength(2)
    expect(group?.events[0]?.date).toBe('2026-05-02')
    expect(group?.events[1]?.date).toBe('2026-05-08')
  })

  it('should treat partial date 2026-04 as end of April (April 30)', () => {
    const partialDateItem = findGroup('next-month')?.events.find(
      (e) => e.date === '2026-04',
    )
    expect(partialDateItem).toBeDefined()
    expect(partialDateItem?.content).toBe('apr: theatre ???')
  })
})

import { TimelineItem } from '../types'
import { formatDistanceToNow, format } from 'date-fns'

export function sorted(items: TimelineItem[]): TimelineItem[] {
  return items.sort((a, b) => {
    // if one of the date is just YYYY, then treat it as the end of the year
    // if one of the date is just YYYY-MM, then treat it as the end of the month
    const [yearA, monthA, dayA] = a.date.split('-')
    const [yearB, monthB, dayB] = b.date.split('-')

    const yA = parseInt(yearA, 10)
    const mA = monthA ? parseInt(monthA, 10) : 12
    const dA = dayA ? parseInt(dayA, 10) : new Date(yA, mA, 0).getDate()

    const yB = parseInt(yearB, 10)
    const mB = monthB ? parseInt(monthB, 10) : 12
    const dB = dayB ? parseInt(dayB, 10) : new Date(yB, mB, 0).getDate()

    const dateA = new Date(yA, mA - 1, dA)
    const dateB = new Date(yB, mB - 1, dB)
    return dateA.getTime() - dateB.getTime()
  })
}

export function extractYears(items: TimelineItem[]): string[] {
  const years = new Set<string>()
  items.forEach((item) => {
    const year = item.date.split('-')[0]
    if (!year) return
    years.add(year)
  })
  return Array.from(years).sort((a, b) => parseInt(a) - parseInt(b))
}

// this function groups items in the following categories:
// - passed events
// - today's events
// - tomorrow's events
// - this week's events
// - next week's events
// - this month's events
// - next month's events
// - second next month's events
// - third next month's events
// - this year's events
// - future events
export function groupTimeline(
  items: TimelineItem[],
): Record<string, TimelineItem[]> {
  const today = new Date()

  const passedEvents: TimelineItem[] = []
  const todaysEvents: TimelineItem[] = []
  const tomorrowsEvents: TimelineItem[] = []
  const thisWeeksEvents: TimelineItem[] = []
  const nextWeeksEvents: TimelineItem[] = []
  const thisMonthsEvents: TimelineItem[] = []
  const nextMonthsEvents: TimelineItem[] = []
  const secondNextMonthsEvents: TimelineItem[] = []
  const thirdNextMonthsEvents: TimelineItem[] = []
  const thisYearsEvents: TimelineItem[] = []
  const nextYearsEvents: TimelineItem[] = []
  const futureEvents: TimelineItem[] = []

  items.forEach((item) => {
    const [year, month, day] = item.date.split('-')

    if (!year) {
      console.warn('Item without a year:', item)
      return
    }

    const yearNum = parseInt(year, 10)
    const monthNum = month ? parseInt(month, 10) : 12
    // Use last day of the month when no day is specified
    const dayNum = day
      ? parseInt(day, 10)
      : new Date(yearNum, monthNum, 0).getDate()

    const itemDate = new Date(yearNum, monthNum - 1, dayNum)

    console.log(item.date, itemDate.toDateString(), today.toDateString())

    if (itemDate.toDateString() === today.toDateString()) {
      todaysEvents.push(item)
    } else if (itemDate < today) {
      passedEvents.push(item)
    } else if (
      itemDate.toDateString() ===
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      ).toDateString()
    ) {
      tomorrowsEvents.push(item)
    } else if (
      itemDate >=
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - ((today.getDay() + 6) % 7),
        ) &&
      itemDate <
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - ((today.getDay() + 6) % 7) + 7,
        )
    ) {
      thisWeeksEvents.push(item)
    } else if (
      itemDate >=
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - ((today.getDay() + 6) % 7) + 7,
        ) &&
      itemDate <
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - ((today.getDay() + 6) % 7) + 14,
        )
    ) {
      nextWeeksEvents.push(item)
    } else if (
      itemDate >= new Date(today.getFullYear(), today.getMonth(), 1) &&
      itemDate < new Date(today.getFullYear(), today.getMonth() + 1, 1)
    ) {
      thisMonthsEvents.push(item)
    } else if (
      itemDate >= new Date(today.getFullYear(), today.getMonth() + 1, 1) &&
      itemDate < new Date(today.getFullYear(), today.getMonth() + 2, 1)
    ) {
      nextMonthsEvents.push(item)
    } else if (
      itemDate >= new Date(today.getFullYear(), today.getMonth() + 2, 1) &&
      itemDate < new Date(today.getFullYear(), today.getMonth() + 3, 1)
    ) {
      secondNextMonthsEvents.push(item)
    } else if (
      itemDate >= new Date(today.getFullYear(), today.getMonth() + 3, 1) &&
      itemDate < new Date(today.getFullYear(), today.getMonth() + 4, 1)
    ) {
      thirdNextMonthsEvents.push(item)
    } else if (
      itemDate >= new Date(today.getFullYear(), 0, 1) &&
      itemDate < new Date(today.getFullYear() + 1, 0, 1)
    ) {
      thisYearsEvents.push(item)
    } else if (
      itemDate >= new Date(today.getFullYear() + 1, 0, 1) &&
      itemDate < new Date(today.getFullYear() + 2, 0, 1)
    ) {
      nextYearsEvents.push(item)
    } else {
      futureEvents.push(item)
    }
  })

  return {
    passedEvents,
    todaysEvents,
    tomorrowsEvents,
    thisWeeksEvents,
    nextWeeksEvents,
    thisMonthsEvents,
    nextMonthsEvents,
    secondNextMonthsEvents,
    thirdNextMonthsEvents,
    thisYearsEvents,
    nextYearsEvents,
    futureEvents,
  }
}

// date is either 2025 or 2025-01 or 2025-01-01
export function humanDays(date: string): string {
  const [year, month, day] = date.split('-').map((d) => parseInt(d, 10))
  if (!year) return ''
  const itemDate = new Date(year, month ? month - 1 : 0, day || 1)

  return formatDistanceToNow(itemDate, {
    addSuffix: true,
    includeSeconds: true,
  })
}

export function takeYear(date: string): string {
  const year = date.split('-')[0]
  return year ? year : 'Unknown Year'
}

export function formatMonthYear(date: string): string {
  const [year, month] = date.split('-').map((d) => parseInt(d, 10))
  if (!year || !month) return ''
  const itemDate = new Date(year, month - 1, 1)
  return format(itemDate, 'MMMM yyyy')
}

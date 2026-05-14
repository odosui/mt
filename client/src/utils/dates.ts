// parses a date string and formats as YYYY-MM-DD HH:mm:ss
export function formatIso(dstr: string): string {
  const d = new Date(dstr)
  return `${d.getFullYear()}-${
    d.getMonth() + 1
  }-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
}

export function diffInDays(dateString: string) {
  const now = new Date() // Current date and time
  const inputDate = new Date(dateString) // Date created from input string

  // Calculate the difference in time (in milliseconds)
  const diffTime = now.getTime() - inputDate.getTime()

  // Convert the difference to days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export function daysAgo(str: string) {
  const d = diffInDays(str)
  if (d === 0) {
    return 'today'
  }
  return `${d} days ago`
}

// Formats a review interval given in minutes as a short label (e.g. "1m", "10m", "1d", "5d").
export function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${Math.max(0, Math.round(minutes))}m`
  }
  if (minutes < 60 * 24) {
    return `${Math.round(minutes / 60)}h`
  }
  return `${Math.round(minutes / (60 * 24))}d`
}

export function minutesTill(minutes: number) {
  if (minutes <= 0) {
    return 'review now'
  }
  if (minutes < 60) {
    return `in ${Math.round(minutes)} min`
  }
  if (minutes < 60 * 24) {
    return `in ${Math.round(minutes / 60)} h`
  }
  const days = Math.round(minutes / (60 * 24))
  if (days === 1) {
    return 'tomorrow'
  }
  return `in ${days} ${days % 10 === 1 ? 'day' : 'days'}`
}

export function daysTill(days: number) {
  if (days <= 0) {
    return 'review now'
  }
  if (days === 1) {
    return 'tomorrow'
  }
  return 'in ' + days + ' ' + (days % 10 === 1 ? 'day' : 'days')
}

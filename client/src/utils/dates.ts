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

export function daysTill(days: number) {
  if (days <= 0) {
    return 'review now'
  }
  if (days === 1) {
    return 'tomorrow'
  }
  return 'in ' + days + ' ' + (days % 10 === 1 ? 'day' : 'days')
}

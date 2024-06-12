export function crop(title: string, limit: number) {
  if (!title || title.length < limit) {
    return title
  }

  return `${title.substring(0, limit - 3)}...`
}

export function numerize(n: number, singular: string, plural: string) {
  const str = n.toString()
  const lastChar = str[str.length - 1]
  if (lastChar === '1') {
    return `${n} ${singular}`
  }
  return `${n} ${plural}`
}

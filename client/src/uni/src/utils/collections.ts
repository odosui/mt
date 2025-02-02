export function uniq<T>(items: T[]): T[] {
  return [...new Set(items)]
}

export function flatten<T>(items: T[][]): T[] {
  return items.reduce((acc, i) => {
    i.forEach((t) => acc.push(t))
    return acc
  }, [])
}

export function wrapArray<T>(el: T | T[]) {
  return Array.isArray(el) ? el : [el]
}

export function sortBy<T>(
  items: T[],
  keyFn: ((item: T) => string) | ((item: T) => number),
) {
  return items.sort((a, b) => {
    const aKey = keyFn(a)
    const bKey = keyFn(b)

    if (typeof aKey === 'string' && typeof bKey === 'string') {
      return aKey.localeCompare(bKey)
    } else if (typeof aKey === 'number' && typeof bKey === 'number') {
      return aKey - bKey
    } else {
      throw new Error('Invalid type')
    }
  })
}

export function toPairs<T>(obj: { [k: string]: T }): [string, T][] {
  return Object.keys(obj).map((k) => [k, obj[k] as T])
}

export function groupBy<T>(
  items: T[],
  keyFn: ((item: T) => string) | ((item: T) => number),
) {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item)
      const bucket = acc[key]
      if (bucket) {
        bucket.push(item)
      } else {
        acc[key] = [item]
      }
      return acc
    },
    {} as { [k: string]: T[] },
  )
}

export function values(obj: { [k: string]: any }) {
  return Object.keys(obj).map((k) => obj[k])
}

export function range(start: number, end?: number) {
  if (end === undefined) {
    end = start
    start = 0
  }
  return Array.from({ length: end - start }, (_, i) => i + start)
}

export function compact<T>(items: (T | undefined | null)[]): T[] {
  return items.filter((i) => i !== undefined && i !== null) as T[]
}

export function noop() {}

export function maxBy<T>(items: T[], fn: (item: T) => number): T | null {
  if (items.length === 0) {
    return null
  }

  return items.reduce((acc, item) => {
    if (!acc) {
      return item
    }
    const accValue = fn(acc)
    const itemValue = fn(item)
    return itemValue > accValue ? item : acc
  })
}

// =====================
// transform collections
// =====================

export function mergeById<T extends { id: number }>(
  arr: T[],
  id: number,
  parts: Partial<T> | ((item: T) => Partial<T>),
) {
  return arr.map((i) => {
    if (i.id === id) {
      if (typeof parts === 'function') {
        return { ...i, ...parts(i) }
      }
      return { ...i, ...parts }
    }
    return i
  })
}

export function uniqBy<T>(arr: T[], fn: (item: T) => string) {
  const seen = new Set()
  return arr.filter((i) => {
    const key = fn(i)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

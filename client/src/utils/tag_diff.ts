export default function (
  before: string[],
  after: string[],
): { [k: string]: -1 | 1 } {
  const added = after.filter((x) => !before.includes(x))
  const removed = before.filter((x) => !after.includes(x))

  const res: { [k: string]: 1 | -1 } = {}

  added.forEach((x) => (res[x] = 1))
  removed.forEach((x) => (res[x] = -1))

  return res
}

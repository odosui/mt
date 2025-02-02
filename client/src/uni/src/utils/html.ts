export function escapeHTML(input: string) {
  const regex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi

  return input.replace(regex, (match) => {
    const m = match.toLowerCase()
    if (m === '<i>' || m === '</i>') {
      return match
    } else {
      return match.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  })
}

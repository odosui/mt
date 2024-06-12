export function title(snippet: string) {
  const [head, ...tail] = snippet.trim().split('\n').slice(0, 3)
  if (!head) {
    return ''
  }
  const escaped = [`<b>${escapeHTML(head)}</b>`, ...tail.map(escapeHTML)]
    .filter((x) => x && x.trim())
    .map((str) => (str || '').replace('\n', ''))
    .join('\n')
  return escaped
}

function escapeHTML(input: string) {
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

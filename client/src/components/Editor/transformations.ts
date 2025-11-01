export const TRANSFORMATIONS = {
  b: transformBold,
  i: transformItalic,
  l: transformLink,
} as const

// ===============
// TRANSFORMATIONS
// ===============

function transformBold(text: string, start: number, end: number) {
  if (start === end) {
    const insertionPoint = start
    const newText =
      text.substring(0, insertionPoint) +
      '**' +
      '**' +
      text.substring(insertionPoint)

    return { text: newText, start: insertionPoint + 2, end: insertionPoint + 2 }
  }

  const selectedText = text.substring(start, end)

  if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
    const unwrappedText = selectedText.slice(2, -2)
    const newText =
      text.substring(0, start) + unwrappedText + text.substring(end)

    return { text: newText, start, end: start + unwrappedText.length }
  }

  const wrappedText = `**${selectedText}**`
  const newText = text.substring(0, start) + wrappedText + text.substring(end)
  return {
    text: newText,
    start,
    end: start + wrappedText.length,
  }
}

function transformItalic(text: string, start: number, end: number) {
  if (start === end) {
    const insertionPoint = start
    const newText =
      text.substring(0, insertionPoint) +
      '*' +
      '*' +
      text.substring(insertionPoint)

    return { text: newText, start: insertionPoint + 1, end: insertionPoint + 1 }
  }

  const selectedText = text.substring(start, end)

  if (
    selectedText.startsWith('*') &&
    selectedText.endsWith('*') &&
    !(selectedText.startsWith('**') && selectedText.endsWith('**'))
  ) {
    const unwrappedText = selectedText.slice(1, -1)
    const newText =
      text.substring(0, start) + unwrappedText + text.substring(end)

    return { text: newText, start, end: start + unwrappedText.length }
  }

  const wrappedText = `*${selectedText}*`
  const newText = text.substring(0, start) + wrappedText + text.substring(end)
  return {
    text: newText,
    start,
    end: start + wrappedText.length,
  }
}

function transformLink(text: string, start: number, end: number) {
  if (start === end) {
    const insertionPoint = start
    const newText =
      text.substring(0, insertionPoint) +
      '[]()' +
      text.substring(insertionPoint)

    return { text: newText, start: insertionPoint + 1, end: insertionPoint + 1 }
  }

  const selectedText = text.substring(start, end)

  const wrappedText = `[${selectedText}]()`
  const newText = text.substring(0, start) + wrappedText + text.substring(end)

  return {
    text: newText,
    start: start + wrappedText.length - 1,
    end: start + wrappedText.length - 1,
  }
}

// Returns viewport coordinates of the caret inside a textarea.
// Uses a hidden mirror div so the result is accurate for variable-width
// fonts and soft-wrapped lines.
export function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number,
): { top: number; left: number; height: number } {
  const style = window.getComputedStyle(textarea)
  const div = document.createElement('div')

  const props = [
    'boxSizing', 'width',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch',
    'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',
    'textAlign', 'textTransform', 'textIndent', 'textDecoration',
    'letterSpacing', 'wordSpacing', 'tabSize',
  ] as const

  for (const p of props) {
    ;(div.style as unknown as Record<string, string>)[p] =
      (style as unknown as Record<string, string>)[p] ?? ''
  }
  div.style.position = 'absolute'
  div.style.visibility = 'hidden'
  div.style.top = '0'
  div.style.left = '-9999px'
  div.style.whiteSpace = 'pre-wrap'
  div.style.wordWrap = 'break-word'
  div.style.overflow = 'hidden'
  div.style.height = 'auto'

  div.textContent = textarea.value.substring(0, position)
  const span = document.createElement('span')
  // Non-empty content so the span has measurable layout at the caret.
  span.textContent = textarea.value.substring(position) || '.'
  div.appendChild(span)
  document.body.appendChild(div)

  const rect = textarea.getBoundingClientRect()
  const lineHeight =
    parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2

  const coords = {
    top: rect.top + span.offsetTop - textarea.scrollTop,
    left: rect.left + span.offsetLeft - textarea.scrollLeft,
    height: lineHeight,
  }

  document.body.removeChild(div)
  return coords
}

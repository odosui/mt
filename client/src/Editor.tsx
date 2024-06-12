import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'

type Props = {
  initialText: string
  onChange: (changed: string) => void
  readOnly?: boolean
}

const DEFAULT_TEXT = '# New note'

const TRANSFORMATIONS = {
  b: transformBold,
  i: transformItalic,
  l: transformLink,
} as const

const Editor: React.FC<Props> = ({ initialText, onChange }) => {
  const [value, setValue] = useState(initialText)

  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  const ref = useRef<HTMLTextAreaElement>()

  const setSelectionRange = (start: number, end: number): void => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus()
        ref.current.setSelectionRange(start, end)
      }
    }, 0)
  }

  const handleSelect = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSelectionStart(e.target.selectionStart)
    setSelectionEnd(e.target.selectionEnd)
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (
      (event.metaKey || event.ctrlKey) &&
      Object.keys(TRANSFORMATIONS).includes(event.key)
    ) {
      event.preventDefault()

      const transform =
        TRANSFORMATIONS[event.key as keyof typeof TRANSFORMATIONS]

      const {
        text: newText,
        start: newStart,
        end: newEnd,
      } = transform(value, selectionStart, selectionEnd)

      setValue(newText)
      setSelectionRange(newStart, newEnd)
    }
  }

  useEffect(() => {
    if (!ref.current) {
      return
    }

    ref.current?.focus()

    if (initialText === DEFAULT_TEXT) {
      ref.current.setSelectionRange(2, 10)
    }
  }, [initialText])

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> =
    useCallback((v) => {
      setValue(v.target.value)
      onChange(v.target.value)
    }, [])

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      onKeyDown={handleKeyDown}
      ref={(t) => (ref.current = t ?? undefined)}
    />
  )
}

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

export default React.memo(Editor)

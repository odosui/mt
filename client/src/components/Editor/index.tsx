import * as React from 'react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import AutoresizableTextarea from '../../ui/AutoresizableTextarea'
import { TRANSFORMATIONS } from './transformations'
import TagAutocomplete from '../TagAutocomplete'

type Props = {
  initialText: string
  onChange: (changed: string) => void
}

const DEFAULT_TEXT = '# New note'

const Editor: React.FC<Props> = ({ initialText, onChange }) => {
  const [value, setValue] = useState(initialText)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  const [autocompleteVisible, setAutocompleteVisible] = useState(false)
  const [autocompleteQuery, setAutocompleteQuery] = useState('')
  const [autocompletePosition, setAutocompletePosition] = useState({
    top: 0,
    left: 0,
  })
  const [hashPosition, setHashPosition] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const setSelectionRange = (start: number, end: number): void => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(start, end)
        setSelectionStart(start)
        setSelectionEnd(end)
      }
    }, 0)
  }

  const getCaretPosition = useCallback(
    (textarea: HTMLTextAreaElement, position: number) => {
      const textBeforeCaret = textarea.value.substring(0, position)
      const lines = textBeforeCaret.split('\n')
      const currentLine = lines.length - 1
      const charInLine = lines[currentLine]?.length || 0

      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      const top = currentLine * lineHeight + textarea.offsetTop + 20
      const left = charInLine * 8 + textarea.offsetLeft + 10

      return { top, left }
    },
    [],
  )

  const detectHashtagTyping = useCallback((text: string, cursorPos: number) => {
    const textBeforeCursor = text.substring(0, cursorPos)
    const lastHashIndex = textBeforeCursor.lastIndexOf('#')

    if (lastHashIndex === -1) return null

    const textAfterHash = textBeforeCursor.substring(lastHashIndex + 1)
    const hasSpaceAfterHash =
      textAfterHash.includes(' ') || textAfterHash.includes('\n')

    if (hasSpaceAfterHash) return null

    return {
      query: textAfterHash,
      position: lastHashIndex,
    }
  }, [])

  const handleTagSelect = useCallback(
    (tag: string) => {
      if (!textareaRef.current) return

      const beforeHash = value.substring(0, hashPosition)
      const afterCursor = value.substring(selectionStart)
      const newValue = beforeHash + '#' + tag + ' ' + afterCursor
      const newCursorPos = hashPosition + tag.length + 2

      setValue(newValue)
      onChange(newValue)
      setAutocompleteVisible(false)

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    },
    [value, hashPosition, selectionStart, onChange],
  )

  const closeAutocomplete = useCallback(() => {
    setAutocompleteVisible(false)
  }, [])

  const handleTextSelection = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { selectionStart, selectionEnd } = e.target
      setSelectionStart(selectionStart)
      setSelectionEnd(selectionEnd)

      const hashtagMatch = detectHashtagTyping(e.target.value, selectionStart)
      if (hashtagMatch && textareaRef.current) {
        const position = getCaretPosition(textareaRef.current, selectionStart)
        setAutocompleteVisible(true)
        setAutocompleteQuery(hashtagMatch.query)
        setAutocompletePosition(position)
        setHashPosition(hashtagMatch.position)
      } else {
        setAutocompleteVisible(false)
      }
    },
    [detectHashtagTyping, getCaretPosition],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
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
        onChange(newText)
        setSelectionRange(newStart, newEnd)
      }
    },
    [value, selectionStart, selectionEnd],
  )

  useLayoutEffect(() => {
    if (!textareaRef.current) {
      return
    }

    textareaRef.current?.focus()

    if (initialText === DEFAULT_TEXT) {
      textareaRef.current.setSelectionRange(2, 10)
    }
  }, [initialText, textareaRef])

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> =
    useCallback(
      (v) => {
        setValue(v.target.value)
        onChange(v.target.value)

        const cursorPos = v.target.selectionStart
        const hashtagMatch = detectHashtagTyping(v.target.value, cursorPos)
        if (hashtagMatch && textareaRef.current) {
          const position = getCaretPosition(textareaRef.current, cursorPos)
          setAutocompleteVisible(true)
          setAutocompleteQuery(hashtagMatch.query)
          setAutocompletePosition(position)
          setHashPosition(hashtagMatch.position)
        } else {
          setAutocompleteVisible(false)
        }
      },
      [detectHashtagTyping, getCaretPosition],
    )

  return (
    <div className="editor-ac">
      <AutoresizableTextarea
        value={value}
        onChange={handleChange}
        onSelect={handleTextSelection}
        onKeyDown={handleKeyDown}
        ref={(t) => (textareaRef.current = t)}
        minHeight={0}
      />
      <TagAutocomplete
        isVisible={autocompleteVisible}
        query={autocompleteQuery}
        position={autocompletePosition}
        onSelect={handleTagSelect}
        onClose={closeAutocomplete}
      />
    </div>
  )
}

export default React.memo(Editor)

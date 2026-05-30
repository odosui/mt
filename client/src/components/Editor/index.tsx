import * as React from 'react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import AutoresizableTextarea from '../../ui/AutoresizableTextarea'
import { TRANSFORMATIONS } from './transformations'
import TagAutocomplete from '../TagAutocomplete'
import { getCaretCoordinates } from '../../utils/caret'

type Props = {
  initialText: string
  onChange: (changed: string) => void
  onSave: () => void
  onCancel: () => void
  hasChanges: boolean
}

const DEFAULT_TEXT = '# New note'

const Editor: React.FC<Props> = ({
  initialText,
  onChange,
  onSave,
  onCancel,
  hasChanges,
}) => {
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

  const detectHashtagTyping = useCallback((text: string, cursorPos: number) => {
    const before = text.substring(0, cursorPos)
    const lastHash = before.lastIndexOf('#')
    if (lastHash === -1) return null

    // The '#' must be at the start of the text or preceded by whitespace —
    // this filters out URL fragments (foo.com#bar), preprocessor directives
    // (#include), and other in-word '#' characters.
    if (lastHash > 0) {
      const prev = before[lastHash - 1]
      if (prev && !/\s/.test(prev)) return null
    }

    const afterHash = before.substring(lastHash + 1)
    // A space after '#' means it's a markdown heading, not a tag.
    if (afterHash.includes(' ') || afterHash.includes('\n')) return null

    return { query: afterHash, position: lastHash }
  }, [])

  const updateAutocomplete = useCallback(
    (text: string, cursorPos: number) => {
      const match = detectHashtagTyping(text, cursorPos)
      if (match && textareaRef.current) {
        const caret = getCaretCoordinates(textareaRef.current, cursorPos)
        setAutocompleteVisible(true)
        setAutocompleteQuery(match.query)
        setAutocompletePosition({
          top: caret.top + caret.height,
          left: caret.left,
        })
        setHashPosition(match.position)
      } else {
        setAutocompleteVisible(false)
      }
    },
    [detectHashtagTyping],
  )

  const handleTagSelect = useCallback(
    (tag: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      // Read live text/cursor from the DOM — React state may be stale
      // (e.g. fast typing between change and select).
      const text = textarea.value
      const cursorPos = textarea.selectionStart
      const beforeHash = text.substring(0, hashPosition)
      const afterCursor = text.substring(cursorPos)
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
    [hashPosition, onChange],
  )

  const closeAutocomplete = useCallback(() => {
    setAutocompleteVisible(false)
  }, [])

  const handleTextSelection = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { selectionStart, selectionEnd } = e.target
      setSelectionStart(selectionStart)
      setSelectionEnd(selectionEnd)
      updateAutocomplete(e.target.value, selectionStart)
    },
    [updateAutocomplete],
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

      // on cmd/ctrl + enter save the note
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        onSave()
      }

      // on esc, cancel editing
      if (event.key === 'Escape') {
        event.preventDefault()
        if (hasChanges) {
          if (
            confirm(
              'You have unsaved changes. Are you sure you want to discard them?',
            )
          ) {
            onCancel()
          }
        } else {
          onCancel()
        }
      }
    },
    [value, selectionStart, selectionEnd, hasChanges, onSave, onCancel],
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
        updateAutocomplete(v.target.value, v.target.selectionStart)
      },
      [onChange, updateAutocomplete],
    )

  return (
    <div className="editor-ac">
      <AutoresizableTextarea
        value={value}
        onChange={handleChange}
        onSelect={handleTextSelection}
        onKeyDown={handleKeyDown}
        ref={(t) => { textareaRef.current = t }}
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

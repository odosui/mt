import * as React from 'react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import AutoresizableTextarea from '../../ui/AutoresizableTextarea'
import { TRANSFORMATIONS } from './transformations'
import TagAutocomplete from '../TagAutocomplete'
import NoteLinkAutocomplete from '../NoteLinkAutocomplete'
import { getCaretCoordinates } from '../../utils/caret'
import { CaretPosition } from '../../ui/AutocompleteList'
import { NoteRef } from '../../types'
import { detectTrigger, Trigger } from './triggers'
import { Inserted, insertNoteLink, insertTag } from './insertions'

type Props = {
  noteSid: number
  initialText: string
  onChange: (changed: string) => void
  onSave: () => void
  onCancel: () => void
  hasChanges: boolean
}

const DEFAULT_TEXT = '# New note'

const Editor: React.FC<Props> = ({
  noteSid,
  initialText,
  onChange,
  onSave,
  onCancel,
  hasChanges,
}) => {
  const [value, setValue] = useState(initialText)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  const [trigger, setTrigger] = useState<Trigger | null>(null)
  const [triggerPosition, setTriggerPosition] = useState<CaretPosition>({
    top: 0,
    left: 0,
  })

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingSelection = useRef<{ start: number; end: number } | null>(null)

  // Applied right after React writes the new value, before any further
  // keystroke lands; a deferred timer would move the caret under fast typing.
  const setSelectionRange = (start: number, end: number): void => {
    pendingSelection.current = { start, end }
  }

  useLayoutEffect(() => {
    const selection = pendingSelection.current
    if (!selection || !textareaRef.current) return

    pendingSelection.current = null
    textareaRef.current.focus()
    textareaRef.current.setSelectionRange(selection.start, selection.end)
    setSelectionStart(selection.start)
    setSelectionEnd(selection.end)
  })

  const updateAutocomplete = useCallback((text: string, cursorPos: number) => {
    const detected = detectTrigger(text, cursorPos)
    setTrigger(detected)
    if (detected && textareaRef.current) {
      const caret = getCaretCoordinates(textareaRef.current, cursorPos)
      setTriggerPosition({ top: caret.top + caret.height, left: caret.left })
    }
  }, [])

  const applyInsertion = useCallback(
    (insert: (text: string, start: number, end: number) => Inserted) => {
      const textarea = textareaRef.current
      if (!textarea || !trigger) return

      // Read live text/cursor from the DOM — React state may be stale
      // (e.g. fast typing between change and select).
      const { text, cursor } = insert(
        textarea.value,
        trigger.start,
        textarea.selectionStart,
      )

      setValue(text)
      onChange(text)
      setTrigger(null)
      setSelectionRange(cursor, cursor)
    },
    [trigger, onChange],
  )

  const handleTagSelect = useCallback(
    (tag: string) =>
      applyInsertion((text, start, end) => insertTag(text, start, end, tag)),
    [applyInsertion],
  )

  const handleNoteLinkSelect = useCallback(
    (ref: NoteRef) =>
      applyInsertion((text, start, end) =>
        insertNoteLink(text, start, end, ref),
      ),
    [applyInsertion],
  )

  const closeAutocomplete = useCallback(() => {
    setTrigger(null)
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
        isVisible={trigger?.kind === 'tag'}
        query={trigger?.query ?? ''}
        position={triggerPosition}
        onSelect={handleTagSelect}
        onClose={closeAutocomplete}
      />
      <NoteLinkAutocomplete
        isVisible={trigger?.kind === 'noteLink'}
        query={trigger?.query ?? ''}
        position={triggerPosition}
        currentNoteSid={noteSid}
        onSelect={handleNoteLinkSelect}
        onClose={closeAutocomplete}
      />
    </div>
  )
}

export default React.memo(Editor)

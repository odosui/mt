import { useEffect, useMemo, useRef, useState } from 'react'
import debounce from '../utils/debounce'

type Opts<T extends { sid: number }> = {
  /** Notes in the order they appear in the list. */
  notes: T[]
  /** The sid currently shown in the URL, used to seed/sync the highlight. */
  activeSid: string | undefined
  /** Navigates to (and thus loads) the given note. */
  navToNote: (sid: number) => void
  /** When false, navigation is blocked (e.g. a save is in progress). */
  canSwitch: boolean
  /** How long to wait after the last keypress before loading the note. */
  delayMs?: number
}

export function useNoteListNavigation<T extends { sid: number }>({
  notes,
  activeSid,
  navToNote,
  canSwitch,
  delayMs = 500,
}: Opts<T>): { selectedSid: number | null } {
  const [selectedSid, setSelectedSid] = useState<number | null>(null)

  // Keep the highlight in sync with whatever note the URL points at (initial
  // load, clicks, review/delete navigation, etc).
  useEffect(() => {
    if (activeSid) {
      setSelectedSid(parseInt(activeSid))
    }
  }, [activeSid])

  // Stable refs so the global key listener doesn't have to re-bind every render.
  const navToNoteRef = useRef(navToNote)
  navToNoteRef.current = navToNote
  const notesRef = useRef(notes)
  notesRef.current = notes
  const selectedSidRef = useRef(selectedSid)
  selectedSidRef.current = selectedSid
  const canSwitchRef = useRef(canSwitch)
  canSwitchRef.current = canSwitch

  const debouncedNav = useMemo(
    () => debounce((sid: number) => navToNoteRef.current(sid), delayMs),
    [delayMs],
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.metaKey || e.altKey) {
        return
      }
      const key = e.key.toLowerCase()
      if (key !== 'j' && key !== 'k') {
        return
      }
      e.preventDefault()

      if (!canSwitchRef.current) {
        return
      }

      const list = notesRef.current
      if (list.length === 0) {
        return
      }

      const curIdx = list.findIndex((n) => n.sid === selectedSidRef.current)
      const nextIdx = curIdx === -1 ? 0 : key === 'j' ? curIdx + 1 : curIdx - 1
      if (nextIdx < 0 || nextIdx >= list.length) {
        return
      }

      const next = list[nextIdx]
      if (!next) {
        return
      }

      setSelectedSid(next.sid)
      debouncedNav(next.sid)

      requestAnimationFrame(() => {
        document
          .querySelector(`.notes-items .item[data-sid="${next.sid}"]`)
          ?.scrollIntoView({ block: 'nearest' })
      })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [debouncedNav])

  return { selectedSid }
}

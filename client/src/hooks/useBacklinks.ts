import { useEffect, useState } from 'react'
import api from '../api'
import { NoteRef } from '../types'

// `version` refetches when the note changes, e.g. after a save.
export function useBacklinks(sid: number, version: string): NoteRef[] {
  const [loaded, setLoaded] = useState<{ sid: number; refs: NoteRef[] }>({
    sid,
    refs: [],
  })

  useEffect(() => {
    let cancelled = false
    api.notes
      .backlinks(sid)
      .then((refs) => !cancelled && setLoaded({ sid, refs }))
      .catch((e) => console.error('Failed to load backlinks', e))
    return () => {
      cancelled = true
    }
  }, [sid, version])

  // Never show the previous note's backlinks while the new ones load.
  return loaded.sid === sid ? loaded.refs : []
}

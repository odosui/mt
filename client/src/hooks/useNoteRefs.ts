import { useEffect, useState } from 'react'
import api from '../api'
import { NoteRef } from '../types'

export function useNoteRefs(): NoteRef[] {
  const [refs, setRefs] = useState<NoteRef[]>([])

  useEffect(() => {
    let cancelled = false
    api.notes
      .refs()
      .then((r) => !cancelled && setRefs(r))
      .catch((e) => console.error('Failed to load note refs', e))
    return () => {
      cancelled = true
    }
  }, [])

  return refs
}

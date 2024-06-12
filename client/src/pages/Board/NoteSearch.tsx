import { debounce } from 'lodash-es'
import * as React from 'react'
import { useEffect } from 'react'
import api from '../../api'
import { INoteSearch } from '../../types'

import OutsideClickHandler from 'react-outside-click-handler'

const NoteSearch: React.FC<{
  onSelected: (sid: number) => void
}> = ({ onSelected }) => {
  const [active, setActive] = React.useState(false)
  const [notes, setNotes] = React.useState<INoteSearch[]>([])
  const [query, setQuery] = React.useState('')

  async function search(q: string) {
    const res = await api.notes.list(q, 0)
    setNotes(res)
  }

  const searchDebounced = React.useCallback(
    debounce((q: string) => search(q), 500),
    [],
  )

  useEffect(() => {
    if (query) {
      setActive(true)
    }

    if (!query || !query.trim()) return
    searchDebounced(query.trim())
  }, [query])

  function reset() {
    setActive(false)
    setQuery('')
    setNotes([])
  }

  return (
    <OutsideClickHandler
      onOutsideClick={() => {
        reset()
      }}
    >
      <div className={`note-search ${active ? 'active' : ''}`}>
        <input
          type="text"
          placeholder="+ Add a note"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setActive(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              reset()
            }
          }}
        />

        {query && active && (
          <div className="note-items">
            {notes.map((note) => (
              <div
                className="note-item"
                key={note.sid}
                onClick={() => {
                  onSelected(note.sid)
                  reset()
                }}
                dangerouslySetInnerHTML={{ __html: note.snippet }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </OutsideClickHandler>
  )
}

export default NoteSearch

import { PencilIcon, PinIcon, SearchIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import HoveringPreview from '../../components/HoveringPreview'
import Note from '../../components/Note'
import { StateContext } from '../../state/StateProvider'
import Button from '../../ui/Button'
import debounce from '../../utils/debounce'
import { title } from '../../utils/notes'

const Notes: React.FC<{ mode: 'all' | 'fav' | 'review' }> = ({ mode }) => {
  const {
    notes,
    currentNote,
    search,
    addNewNote,
    focusMode,
    getCurrentNodeNeighborSid,
    removeCurrentNote,
    switchNote,
    noteSaving,
    noteLoading,
    pinNote,
    unpinNote,
  } = useContext(StateContext)

  const navigate = useNavigate()
  const pars = useParams<{ sid: string }>()
  const { sid: sidLoc } = pars

  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const tag = urlParams.get('tag') || ''

  const [query, setQuery] = useState('')

  const searchDb = useMemo(() => debounce(search, 500), [search])

  const handleQueryChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    setQuery(value)
    searchDb(value, mode === 'review', mode === 'fav')
  }

  const selectNote = (ind: number) => {
    if (!notes.data) {
      return
    }

    // don't allow to switch note while it's saving is in progress
    if (currentNote !== null && noteSaving) {
      return
    }

    const item = notes.data[ind]
    if (!item) {
      return
    }
    navToNote(item.sid)
  }

  const handleTogglePin = useCallback(
    (sid: number) => {
      const n = notes.data?.find((n) => n.sid === sid)

      if (!n) {
        return
      }

      if (n.pinned) {
        unpinNote(sid)
      } else {
        pinNote(sid)
      }
    },
    [notes.data, pinNote, unpinNote],
  )

  const navToNote = useCallback(
    (sid: number, edit = false) => {
      let pathname = `/app/review/${sid}`
      if (mode === 'all') {
        pathname = `/app/notes/${sid}`
      } else if (mode === 'fav') {
        pathname = `/app/fav/${sid}`
      }

      const pars: Record<string, string> = {}

      if (tag) {
        pars['tag'] = tag
      }

      if (edit) {
        pars['edit'] = 'true'
      }

      const str = new URLSearchParams(pars).toString()

      navigate(`${pathname}?${str}`)
    },
    [mode, navigate, tag],
  )

  const handleReview = useCallback(() => {
    if (mode !== 'review') {
      return
    }

    const nextSid = getCurrentNodeNeighborSid()
    removeCurrentNote()

    if (nextSid) {
      navToNote(nextSid)
    }
  }, [getCurrentNodeNeighborSid, navToNote, removeCurrentNote, mode])

  const handleDelete = useCallback(() => {
    const nextSid = getCurrentNodeNeighborSid()
    removeCurrentNote()

    if (nextSid) {
      navToNote(nextSid)
    }
  }, [getCurrentNodeNeighborSid, navToNote, removeCurrentNote])

  const handleAddNewNote = useCallback(async () => {
    const sid = await addNewNote()
    navToNote(sid, true)
  }, [addNewNote, navToNote])

  // load notes
  useEffect(() => {
    initLoad()

    async function initLoad() {
      const data = await search('', mode === 'review', mode === 'fav', tag)

      if (mode === 'all' && sidLoc) {
        const item = data.find((d) => d.sid === parseInt(sidLoc))
        if (item) {
          navToNote(item.sid)
        }
      } else {
        if (data[0]) {
          navToNote(data[0].sid)
        }
      }
    }
  }, [tag, mode])

  useEffect(() => {
    if (!sidLoc) {
      return
    }
    switchNote(parseInt(sidLoc))
  }, [sidLoc, switchNote])

  const pinnedFirst = (notes.data ?? []).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return 0
  })

  return (
    <div className="page">
      <div className={`notes ${focusMode ? 'meditation' : ''}`}>
        <div className="notes-bar">
          <div className={`search ${notes.loading ? 'loading' : ''}`}>
            <SearchIcon />
            <input
              type="search"
              placeholder="Search notes"
              onChange={handleQueryChange}
              value={query}
            />
          </div>
          <div className="newNote" onClick={handleAddNewNote}>
            <PencilIcon />
          </div>
        </div>
        <div className="notes-items">
          {!notes.loading && (!notes.data || notes.data.length === 0) && (
            <div className="no-results">
              Click the pencil icon to add your first note.
            </div>
          )}
          {(pinnedFirst || []).map((note, ind) => (
            <div
              className={`item ${
                sidLoc && note.sid === parseInt(sidLoc) ? 'active' : ''
              } ${note.pinned ? ' pinned' : ''} `}
              key={note.id}
              onClick={() => selectNote(ind)}
            >
              <div className="note-head">
                <div className="left">
                  <div className="sid">#{note.sid}</div>
                  {'·'}
                  <div className="updated-at">
                    {note.updated_at_in_words ?? 'just now'}
                  </div>
                </div>
                <div className="right">
                  <button
                    className="icon-button"
                    onClick={() => handleTogglePin(note.sid)}
                  >
                    <PinIcon size={16} />
                  </button>
                </div>
              </div>
              <div
                className="snippet"
                dangerouslySetInnerHTML={{ __html: title(note.snippet) }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="note-area">
        {!noteLoading && currentNote && (
          <Note onReview={handleReview} onDelete={handleDelete} />
        )}

        {!noteLoading &&
          !currentNote &&
          mode !== 'review' &&
          notes.data?.length === 0 && (
            <div className="placeholder">
              <Button
                icon={<PencilIcon />}
                onClick={handleAddNewNote}
                style={{ margin: 'auto' }}
              >
                Create you first note
              </Button>
            </div>
          )}

        {!noteLoading && !currentNote && mode === 'review' && (
          <div className="placeholder">🔥 All notes reviewed.</div>
        )}
      </div>

      <HoveringPreview />
    </div>
  )
}

export default Notes

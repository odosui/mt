import React, { useContext, useEffect } from 'react'
import { StateContext } from '../state/StateProvider'
import { title } from '../utils/notes'

import { useLocation, useNavigate } from 'react-router-dom'
import Spinner from '../ui/Spinner'

const NotesMobile: React.FC<{ review: boolean }> = ({ review = false }) => {
  const { notes, search } = useContext(StateContext)

  const navigate = useNavigate()

  const selectNote = (ind: number) => {
    if (!notes.data) {
      return
    }
    const item = notes.data[ind]
    if (!item) {
      return
    }

    navigate(`/app/notes/${item.sid}`)
  }

  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const tag = urlParams.get('tag') || ''

  useEffect(() => {
    search('', review, false, tag)
  }, [search, review, tag])

  return (
    <div className="mobile-page notes-mobile">
      <div className="items">
        {notes.loading && <Spinner />}

        {!notes.loading && (!notes.data || notes.data.length === 0) && (
          <div className="no-results">
            Click the pencil icon to add your first note.
          </div>
        )}
        {(notes.data || []).map((note, ind) => (
          <div className="item" key={note.id} onClick={() => selectNote(ind)}>
            <div className="note-head">
              <div className="sid">
                #{note.sid} · {note.updated_at_in_words}
              </div>

              <Tags tags={note.tags} />
            </div>
            <div
              className="snippet"
              dangerouslySetInnerHTML={{ __html: title(note.snippet) }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const Tags: React.FC<{ tags: string[] }> = ({ tags }) => {
  const [first, second, third, ...rest] = tags

  if (rest.length === 0) {
    return (
      <div className="note-tags">
        {[first, second, third]
          .filter((t) => !!t)
          .map((t) => (
            <span key={t}>#{t}</span>
          ))}
      </div>
    )
  }

  const left = rest.length + 1

  return (
    <div className="note-tags">
      {[first, second].map((t) => (
        <span key={t}>#{t}</span>
      ))}
      <span>+{left} more</span>
    </div>
  )
}

export default NotesMobile

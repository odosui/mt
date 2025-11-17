import { CheckIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Preview from '../components/Preview'
import { StateContext } from '../state/StateProvider'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'

const Note: React.FC = () => {
  const { sid } = useParams<{ sid: string }>()

  const previewRef = React.useRef<HTMLDivElement>(null)

  const { currentNote, noteLoading, markReviewedCurrentNote, switchNote } =
    useContext(StateContext)

  const handleReview: React.MouseEventHandler = async () => {
    markReviewedCurrentNote()
  }

  useEffect(() => {
    if (!sid) {
      return
    }
    switchNote(parseInt(sid))
  }, [switchNote, sid])

  const note = currentNote

  return (
    <div className="mobile-page note-mobile note-area">
      {noteLoading && <Spinner />}
      {!noteLoading && note && (
        <>
          <div className="mobile-note-top-header">
            {note.needs_review && (
              <Button onClick={handleReview}>
                <CheckIcon />
                Mark Reviewed
              </Button>
            )}
          </div>
          <div className="note-section">
            <div className="editor-place">
              <div className="note-editor-body" ref={previewRef}>
                <Preview
                  markdown={currentNote.body}
                  imageMetas={currentNote.image_metas}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Note

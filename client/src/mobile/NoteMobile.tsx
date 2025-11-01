import { CheckIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PreviewAndEditor from '../components/PreviewAndEditor'
import { StateContext } from '../state/StateProvider'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'

const Note: React.FC = () => {
  const { sid } = useParams<{ sid: string }>()

  const previewRef = React.useRef<HTMLDivElement>(null)

  const {
    currentNote,
    noteLoading,
    saveCurrentNote,
    markReviewedCurrentNote,
    switchNote,
  } = useContext(StateContext)

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
              <PreviewAndEditor
                sid={currentNote.sid}
                body={currentNote.body}
                mode="view"
                previewRef={previewRef}
                onPendingStart={noop}
                onPendingEnd={noop}
                saveFn={saveCurrentNote}
                imageMetas={currentNote.image_metas}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const noop = () => {}

export default Note

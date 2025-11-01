import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StateContext } from '../state/StateProvider'
import Preview from './Preview'
import { XIcon } from '@primer/octicons-react'

const HoveringPreview: React.FC = () => {
  const [visible, setVisible] = useState(false)

  const {
    previewNote: { data: note },
    loadPreviewNote,
  } = useContext(StateContext)

  useEffect(() => {
    if (note) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [note])

  const navigate = useNavigate()

  const handleClose: React.MouseEventHandler = () => {
    setVisible(false)
  }

  const handleEdit: React.MouseEventHandler = (e) => {
    e.preventDefault()
    if (note) {
      navigate(`/app/notes/${note.sid}`)
    }
    setVisible(false)
    loadPreviewNote(null)
  }

  return (
    <div
      className={`with-note-elements hovering-preview ${
        visible ? 'visible' : ''
      }`}
    >
      <div className="bar">
        <div className="left">
          <div onClick={handleClose}>
            <XIcon />
          </div>
        </div>
        <div className="right">
          <a href="#" onClick={handleEdit}>
            {' '}
            Edit {`#${note?.sid} →`}
          </a>
        </div>
      </div>
      {note && (
        <div className="body">
          <Preview markdown={note.body} imageMetas={note.image_metas} />
        </div>
      )}
    </div>
  )
}

export default HoveringPreview

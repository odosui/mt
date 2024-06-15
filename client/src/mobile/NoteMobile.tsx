import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterNoneIcon from '@mui/icons-material/FilterNone'
import GetAppIcon from '@mui/icons-material/GetApp'
import CheckIcon from '@mui/icons-material/Check'
import MenuIcon from '@mui/icons-material/Menu'
import MyLocation from '@mui/icons-material/MyLocation'
import SaveIcon from '@mui/icons-material/Save'
import { Fab } from '@mui/material'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'
import { useParams } from 'react-router-dom'
import CSSTransition from 'react-transition-group/CSSTransition'
import Editor from '../Editor'
import { StateContext } from '../state/StateProvider'
import Spinner from '../ui/Spinner'
import { copyToClipboard } from '../uni/src/utils/clipboard'
import debounce from '../utils/debounce'

const SAVE_THRESHOLD = 1500

const Note: React.FC = () => {
  const [pending, setPending] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reviewMenuOpen, setReviewMenuOpen] = useState(false)

  const { sid } = useParams<{ sid: string }>()

  const {
    currentNote,
    noteLoading,
    noteSaving,
    saveCurrentNote,
    deleteCurrentNote,
    toggleFocusMode,
    focusMode,
    markReviewedCurrentNote,
    switchNote,
  } = useContext(StateContext)

  const saveVal = debounce(async (val: string) => {
    await saveCurrentNote(val)
    setPending(false)
  }, SAVE_THRESHOLD)

  const handleChange = (val: string) => {
    setPending(true)
    saveVal(val)
  }

  const handleDelete: React.MouseEventHandler = async () => {
    if (confirm('Are you sure want to delete this note?')) {
      deleteCurrentNote()
    }
    setMenuOpen(false)
  }

  const handleMenuToggle: React.MouseEventHandler = (e) => {
    e.preventDefault()
    setMenuOpen(!menuOpen)
  }

  const handleReviewMenuToggle: React.MouseEventHandler = (e) => {
    e.preventDefault()
    setReviewMenuOpen(!reviewMenuOpen)
  }

  const handleReview: React.MouseEventHandler = async () => {
    markReviewedCurrentNote()
  }

  const handleCopyToClipboard = () => {
    if (!currentNote) {
      return
    }
    copyToClipboard(currentNote.body || '')
    setMenuOpen(false)
  }

  const handleDownload = () => {
    if (!currentNote) {
      return
    }
    window.location.href = `/api/notes/${currentNote.sid}.md`
    setMenuOpen(false)
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
          <div className="note-panel">
            <div className="note-panel-inner">
              <CSSTransition
                in={menuOpen}
                classNames="atop"
                timeout={200}
                unmountOnExit
              >
                <OutsideClickHandler
                  onOutsideClick={() => {
                    if (menuOpen) {
                      setMenuOpen(false)
                    }
                  }}
                >
                  <div className="dropdown-menu">
                    <div className="menu-item" onClick={handleCopyToClipboard}>
                      <FilterNoneIcon />
                      <span>Copy to clipboard</span>
                    </div>
                    <div className="menu-item" onClick={handleDownload}>
                      <GetAppIcon />
                      <span>Download as markdown</span>
                    </div>
                    <div className="menu-item" onClick={handleDelete}>
                      <DeleteIcon />
                      <span>Delete note</span>
                    </div>
                  </div>
                </OutsideClickHandler>
              </CSSTransition>
              <div className="inside">
                <div className="left">
                  <SaveIcon
                    className={`save ${pending ? 'pending' : ''} ${
                      noteSaving ? 'saving' : ''
                    }`}
                  />
                </div>
                <div className="right">
                  <a
                    href="#"
                    className={`menu-action menu-action-more ${
                      reviewMenuOpen ? 'active' : ''
                    }`}
                    onClick={handleReviewMenuToggle}
                  >
                    {reviewMenuOpen ? (
                      <CloseIcon />
                    ) : (
                      <span className="level">L{note.level || 0}</span>
                    )}
                  </a>
                  <a
                    href="#"
                    className={`menu-action ${focusMode ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFocusMode()
                    }}
                    title={focusMode ? 'Quit the focus mode' : 'Focus mode'}
                  >
                    <MyLocation />
                  </a>
                  <a
                    href="#"
                    className={`menu-action menu-action-more ${
                      menuOpen ? 'active' : ''
                    }`}
                    title="More menu items"
                    onClick={handleMenuToggle}
                  >
                    {menuOpen ? <CloseIcon /> : <MenuIcon />}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="note-section">
            <div className="editor-place">
              <Editor
                initialText={note.body}
                onChange={handleChange}
                key={note.sid}
              />
            </div>
          </div>
          {note.needs_review && (
            <div className="bottom-review-btn">
              <Fab variant="extended" onClick={handleReview}>
                <CheckIcon sx={{ mr: 1 }} />
                Mark Reviewed
              </Fab>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Note

import {
  BeakerIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileMediaIcon,
  GoalIcon,
  NoteIcon,
  QuestionIcon,
  StarIcon,
  ThreeBarsIcon,
  XIcon,
} from '@primer/octicons-react'
import * as React from 'react'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'slim-react-router'
import { StateContext } from '../../state/StateProvider'
import Button from '../../ui/Button'
import DropdownMenu from '../../ui/DropdownMenu'
import EditSwitch from '../../ui/EditSwitch'
import pubsub from '../../utils/pubsub'
import Editor from '../Editor'
import Preview from '../Preview'
import Flashcards from './Flashcards'
import HelpModal from './HelpModal'
import Images from './Images'
import Quizzes from './Quizzes'
import PublishSettingsModal from './PublishSettingsModal'
import ReviewMenu from './ReviewMenu'
import { SelectionMenu } from './SelectionMenu'

function useQuery() {
  const { search } = useLocation()
  return React.useMemo(() => new URLSearchParams(search), [search])
}

const Note: React.FC<{
  onReview?: () => void
  onDelete?: () => void
}> = ({ onReview, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [reviewMenuOpen, setReviewMenuOpen] = useState(false)
  const [isPublishModalOpen, setIsPublishMenuOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>('view')

  const [updatedBody, setUpdatedBody] = useState<string>('')

  const handleChange = (changed: string) => {
    setUpdatedBody(changed)
  }

  const query = useQuery()
  const edit = query.get('edit')

  const {
    currentNote,
    deleteCurrentNote,
    markReviewedCurrentNote,
    toggleFocusMode,
    focusMode,
    noteSaving,
    toggleFavCurrentNote,
    toggleFlashcardsVisible,
    toggleImagesVisible,
    toggleQuizzesVisible,
    flashcardsVisible,
    imagesVisible,
    quizzesVisible,
    createNoteAndLinkFromCurrent,
    saveCurrentNote,
  } = useContext(StateContext)

  useEffect(() => {
    setUpdatedBody(currentNote?.body || '')
  }, [currentNote])

  useEffect(() => {
    setMode(edit ? 'edit' : 'view')
  }, [edit])

  const handleDelete: React.MouseEventHandler = async () => {
    if (confirm('Are you sure want to delete this note?')) {
      deleteCurrentNote()

      if (onDelete) {
        onDelete()
      }
    }
    setMenuOpen(false)
  }

  const handleReview: React.MouseEventHandler = async () => {
    markReviewedCurrentNote()
    if (onReview) {
      onReview()
    }
  }

  const handleMenuToggle: React.MouseEventHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  const handleReviewMenuToggle: React.MouseEventHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setReviewMenuOpen(!reviewMenuOpen)
  }

  const handleCopyToClipboard = () => {
    if (!currentNote) {
      return
    }
    const note = currentNote
    if (!note) {
      return
    }
    copyToClipboard(note.body || '')
    setMenuOpen(false)
  }

  const handleDownload = () => {
    if (!currentNote) {
      return
    }
    const note = currentNote
    if (!note) {
      return
    }
    window.location.href = `/api/notes/${note.sid}.md`
    setMenuOpen(false)
  }

  const handleOpenPublishMenu: React.MouseEventHandler = (e) => {
    e.preventDefault()
    setIsPublishMenuOpen(true)
    setMenuOpen(false)
  }

  const handleOpenHelp: React.MouseEventHandler = (e) => {
    e.preventDefault()
    setIsHelpModalOpen(true)
    setMenuOpen(false)
  }

  const handleFav: React.MouseEventHandler = (e) => {
    e.preventDefault()
    toggleFavCurrentNote()
  }

  async function doSaveCurrentNote() {
    if (hasChanges) {
      await saveCurrentNote(updatedBody)
    }
    setMode('view')
  }

  const doCancelEdit = () => {
    handleModeChange('view', false)
  }

  const hasChanges = updatedBody !== currentNote?.body

  const handleModeChange = async (m: 'edit' | 'view', shouldSave: boolean) => {
    setMode(m)
    if (m === 'view' && shouldSave) {
      doSaveCurrentNote()
    } else if (m === 'view' && !shouldSave) {
      // Reset updatedBody to original when canceling
      setUpdatedBody(currentNote?.body || '')
    }
  }

  const handleAnswerCard = (text: string) => {
    pubsub.publish('flashCardFromAnswer', text)
  }

  const handleQuestionCard = (text: string) => {
    pubsub.publish('flashCardFromQuestion', text)
  }

  const handleCreateNote = (title: string) => {
    createNoteAndLinkFromCurrent(title)
  }

  const handleAskAI = async (text: string) => {
    pubsub.publish('flashCardsFromAI', text)
  }

  const handleReviewMenuClose = useCallback(() => {
    setReviewMenuOpen(false)
  }, [])

  const previewRef = useRef<HTMLDivElement>(null)

  if (!currentNote) {
    return null
  }

  return (
    <div className="inner">
      {mode === 'view' && (
        <SelectionMenu
          onUseAsAnswer={handleAnswerCard}
          onUseAsQuestion={handleQuestionCard}
          onCreateNote={handleCreateNote}
          onAskAI={handleAskAI}
          areaRef={previewRef}
        />
      )}

      <PublishSettingsModal
        open={isPublishModalOpen}
        onClose={() => {
          setIsPublishMenuOpen(false)
        }}
        note={currentNote}
      />

      <HelpModal
        open={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <div className="note-section">
        <div className="editor-place">
          {!flashcardsVisible && !focusMode && (
            <div
              className="side-toggler flashcards-toggler"
              onClick={toggleFlashcardsVisible}
            >
              <NoteIcon /> Flashcards
            </div>
          )}

          {!imagesVisible && !focusMode && (
            <div
              className="side-toggler images-toggler"
              onClick={toggleImagesVisible}
            >
              <FileMediaIcon /> Images
            </div>
          )}

          {!quizzesVisible && !focusMode && (
            <div
              className="side-toggler quizzes-toggler"
              onClick={toggleQuizzesVisible}
            >
              <BeakerIcon /> Quizzes
            </div>
          )}

          <div className="note-panel">
            <div className="note-panel-inner">
              <DropdownMenu
                open={reviewMenuOpen}
                onClose={handleReviewMenuClose}
              >
                <ReviewMenu
                  noteSid={currentNote.sid}
                  upcomingReviews={currentNote.upcoming_reviews_in_days}
                />
              </DropdownMenu>

              <DropdownMenu
                open={menuOpen}
                onClose={() => {
                  setMenuOpen(false)
                }}
              >
                <div className="menu-item" onClick={handleCopyToClipboard}>
                  <CopyIcon />
                  <span>Copy to clipboard</span>
                </div>
                <div className="menu-item" onClick={handleDownload}>
                  <DownloadIcon />
                  <span>Download as markdown</span>
                </div>
                <div className="menu-item" onClick={handleOpenPublishMenu}>
                  <EyeIcon />
                  <span>Publish</span>
                </div>
                <div className="menu-item" onClick={handleOpenHelp}>
                  <QuestionIcon />
                  <span>How to use the editor?</span>
                </div>
                <div className="menu-item" onClick={handleDelete}>
                  <XIcon />
                  <span>Delete note</span>
                </div>
              </DropdownMenu>
              <div className="inside">
                <div className="left">
                  <div className="edit-toggle">
                    <EditSwitch
                      value={mode}
                      onChange={handleModeChange}
                      saving={noteSaving}
                      hasChanges={hasChanges}
                    />
                  </div>
                </div>
                <div className="right">
                  {currentNote.needs_review && (
                    <Button
                      icon={<CheckIcon />}
                      onClick={handleReview}
                      className="lite-btn review-btn pending"
                    >
                      mark as reviewed
                    </Button>
                  )}
                  <a
                    href="#"
                    className={`menu-action menu-action-more ${
                      reviewMenuOpen ? 'active' : ''
                    }`}
                    onClick={handleReviewMenuToggle}
                  >
                    {reviewMenuOpen ? (
                      <XIcon />
                    ) : (
                      <span className="level">L{currentNote.level || 0}</span>
                    )}
                  </a>
                  <a
                    onClick={handleFav}
                    className={`menu-action ${
                      currentNote.favorite ? 'active' : ''
                    }`}
                    title={
                      currentNote.favorite
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                  >
                    <StarIcon />
                  </a>
                  {currentNote.published && currentNote.seo_url && (
                    <a
                      onClick={handleOpenPublishMenu}
                      className="menu-action active"
                    >
                      <EyeIcon />
                    </a>
                  )}
                  <a
                    href="#"
                    className={`menu-action ${focusMode ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFocusMode()
                    }}
                    title={focusMode ? 'Quit the focus mode' : 'Focus mode'}
                  >
                    <GoalIcon />
                  </a>
                  <a
                    href="#"
                    className={`menu-action menu-action-more ${
                      menuOpen ? 'active' : ''
                    }`}
                    title="More menu items"
                    onClick={handleMenuToggle}
                  >
                    {menuOpen ? <XIcon /> : <ThreeBarsIcon />}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="note-editor-body" ref={previewRef}>
            {mode === 'view' && (
              <Preview
                markdown={currentNote.body}
                imageMetas={currentNote.image_metas}
              />
            )}
            {mode === 'edit' && (
              <Editor
                initialText={currentNote.body}
                onChange={handleChange}
                key={currentNote.sid}
                onSave={doSaveCurrentNote}
                onCancel={doCancelEdit}
                hasChanges={hasChanges}
              />
            )}
          </div>
        </div>
        {!focusMode && <Flashcards noteId={currentNote.id} />}
        {!focusMode && <Images noteSid={currentNote.sid} />}
        {!focusMode && <Quizzes noteId={currentNote.id} />}
      </div>
    </div>
  )
}

export default Note

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

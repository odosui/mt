import React, { RefObject, useEffect, useState } from 'react'
import {
  PlusIcon,
  QuestionIcon,
  SparkleFillIcon,
  GoalIcon,
} from '@primer/octicons-react'

type Props = {
  areaRef: RefObject<HTMLDivElement>
  onUseAsAnswer: (text: string) => void
  onUseAsQuestion: (text: string) => void
  onAskAI: (text: string) => void
  onCreateNote: (text: string) => void
}

export const SelectionMenu: React.FC<Props> = ({
  areaRef,
  onUseAsAnswer,
  onUseAsQuestion,
  onAskAI,
  onCreateNote,
}) => {
  const [textSelected, setTextSelected] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)

  const menuRef = React.useRef<HTMLDivElement>(null)

  const handleAnswerCard = () => {
    onUseAsAnswer(textSelected || '')
    setVisible(false)
  }

  const handleQuestionCard = () => {
    onUseAsQuestion(textSelected || '')
    setVisible(false)
  }

  const handleAskAI = () => {
    onAskAI(textSelected || '')
    setVisible(false)
  }

  const handleCreateNote = () => {
    onCreateNote(textSelected || '')
    setVisible(false)
  }

  useEffect(() => {
    if (!areaRef.current) {
      return
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (!areaRef.current) {
        return
      }

      if (!areaRef.current.contains(event.target as Node)) {
        return
      }

      const selection = window.getSelection()
      const text = selection?.toString()?.trim()
      if (selection && text) {
        setTextSelected(selection.toString()?.trim())
        setVisible(true)

        const clientRect = selection.getRangeAt(0).getBoundingClientRect()

        const noteEl = document.querySelector('.note-area')
        const noteRect = noteEl?.getBoundingClientRect()
        const noteTop = noteRect?.top || 0
        const noteLeft = noteRect?.left || 0

        setLeft(window.pageXOffset + clientRect.left - noteLeft)
        setTop(window.pageYOffset + clientRect.bottom - noteTop)
      } else {
        setTextSelected(null)
        setVisible(false)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [areaRef.current])

  useEffect(() => {
    if (!menuRef.current) {
      return
    }

    const el = menuRef.current

    const handleDocClick = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('mousedown', handleDocClick)
    return () => {
      document.removeEventListener('mousedown', handleDocClick)
    }
  }, [menuRef.current])

  if (!visible) {
    return null
  }

  return (
    <div
      ref={menuRef}
      className="selection-menu"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      <div className="menu-item" onClick={handleCreateNote}>
        <PlusIcon />
        <span>Create note</span>
      </div>
      <hr />
      <div className="menu-item" onClick={handleAnswerCard}>
        <GoalIcon />
        <span>Flashcard as answer</span>
      </div>
      <div className="menu-item" onClick={handleQuestionCard}>
        <QuestionIcon />
        <span>Flashcard as question</span>
      </div>
      <div className="menu-item" onClick={handleAskAI}>
        <SparkleFillIcon />
        <span>Ask AI to create cards</span>
      </div>
    </div>
  )
}

import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import api from '../api'
import { StateContext } from '../state/StateProvider'
import { Question } from '../types'
import AutoresizableTextarea from '../ui/AutoresizableTextarea'
import { PencilIcon, XIcon } from '@primer/octicons-react'
import { minutesTill } from '../utils/dates'

const SHOW_ANSWER_FOR = 3000

const QuestionCard: React.FC<{
  q: Question
  onDelete: () => void
  onUpdate: (oldQuestion: string, updated: Question) => void
}> = ({ q, onDelete, onUpdate }) => {
  const [showAnswer, setShowAnswer] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [questionToEdit, setQuestionToEdit] = useState(q.question)
  const [answerToEdit, setAnswerToEdit] = useState(q.answer)

  const { reloadCounters } = useContext(StateContext)

  const flipCard = () => {
    setShowAnswer(true)
    setTimeout(() => {
      setShowAnswer(false)
    }, SHOW_ANSWER_FOR)
  }

  const handleDelete: React.MouseEventHandler = async (e) => {
    if (!confirm('Are you sure want to delete this card?')) {
      return
    }
    e.preventDefault()
    await api.questions.del(q.note_id, q.question)
    reloadCounters()
    onDelete()
  }

  const handleEdit: React.MouseEventHandler = async (e) => {
    e.preventDefault()
    setEditMode(true)
  }

  const handleUpdate: React.FormEventHandler = async (e) => {
    e.preventDefault()
    if (!questionToEdit || !answerToEdit) {
      return
    }

    const upd = await api.questions.update(
      q.note_id,
      q.question,
      questionToEdit,
      answerToEdit,
    )
    onUpdate(q.question, upd)
  }

  useEffect(() => {
    setEditMode(false)
  }, [q])

  return (
    <div className="flashcard">
      {editMode && (
        <div className="quiz-menu-form">
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <AutoresizableTextarea
                placeholder="Question"
                name="question"
                autoFocus={true}
                value={questionToEdit}
                minHeight={48}
                onChange={(e) => setQuestionToEdit(e.target.value)}
              />
            </div>
            <div className="form-row">
              <AutoresizableTextarea
                placeholder="Answer"
                name="answer"
                value={answerToEdit}
                onChange={(e) => setAnswerToEdit(e.target.value)}
                minHeight={48}
              />
            </div>
            <div className="form-row">
              <button type="submit" className="btn">
                Update
              </button>
            </div>
          </form>
        </div>
      )}
      {!editMode && (
        <div className={`inner ${showAnswer ? 'flipped' : ''}`}>
          <div
            className="front"
            onClick={() => flipCard()}
            title="Click to show the answer"
          >
            <div className="edit-card" onClick={handleEdit}>
              <PencilIcon />
            </div>
            <div className="remove-card" onClick={handleDelete}>
              <XIcon />
            </div>
            <div className="card-view-question">{q.question}</div>
            <div className="card-view-info">
              {q.completed
                ? 'completed'
                : q.minutes_till_next_review != null
                  ? minutesTill(q.minutes_till_next_review)
                  : ''}
            </div>
          </div>
          <div className="back">{q.answer}</div>
        </div>
      )}
    </div>
  )
}

export default QuestionCard

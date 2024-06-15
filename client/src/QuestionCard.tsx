import {
  XMarkIcon as Close,
  PencilIcon as Edit,
  PhotoIcon as Image,
} from '@heroicons/react/24/solid'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import api from './api'
import { StateContext } from './state/StateProvider'
import { Question } from './types'
import Spinner from './ui/Spinner'

const SHOW_ANSWER_FOR = 3000

const QuestionCard: React.FC<{
  q: Question
  onDelete: () => void
  onUpdate: (updated: Question) => void
}> = ({ q, onDelete, onUpdate }) => {
  const [showAnswer, setShowAnswer] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [questionToEdit, setQuestionToEdit] = useState(q.question)
  const [answerToEdit, setAnswerToEdit] = useState(q.answer)
  const [imageGenerating, setImageGenerating] = useState(false)

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
    await api.questions.del(q.id)
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

    const upd = await api.questions.update(q.id, questionToEdit, answerToEdit)
    onUpdate(upd)
  }

  const handleRegenerateImage: React.MouseEventHandler = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (imageGenerating) {
      return
    }

    setImageGenerating(true)
    const upd = await api.questions.regenImage(q.id)
    setImageGenerating(false)
    onUpdate(upd)
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
              <input
                type="text"
                placeholder="Question"
                name="question"
                autoFocus={true}
                value={questionToEdit}
                onChange={(e) => setQuestionToEdit(e.target.value)}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="Answer"
                name="answer"
                value={answerToEdit}
                onChange={(e) => setAnswerToEdit(e.target.value)}
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
            <div
              className="regenerate-image-card"
              onClick={handleRegenerateImage}
            >
              <Image />
            </div>
            <div className="edit-card" onClick={handleEdit}>
              <Edit />
            </div>
            <div className="remove-card" onClick={handleDelete}>
              <Close />
            </div>
            {imageGenerating && (
              <div className="card-view-image">
                <Spinner />
              </div>
            )}
            {!imageGenerating && q.image_url && (
              <div className="card-view-image">
                <img src={q.image_url} alt={q.question} />
              </div>
            )}
            <div className="card-view-question">{q.question}</div>
            <div className="card-view-info">
              {q.days_till_next_review <= 0
                ? 'review now'
                : q.days_till_next_review === 1
                ? 'review tomorrow'
                : `review in ${q.days_till_next_review} days`}
            </div>
          </div>
          <div className="back">{q.answer}</div>
        </div>
      )}
    </div>
  )
}

export default QuestionCard

import * as React from 'react'
import { useState } from 'react'
import api from '../../../api'
import { Quiz } from '../../../types'
import Button from '../../../ui/Button'
import Spinner from '../../../ui/Spinner'

const TEXT_MAX_LENGTH = 65536
const MAX_QUESTIONS = 100

const MODELS = [
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5' },
  { id: 'claude-sonnet-4-5', label: 'Sonnet 4.5' },
  { id: 'claude-opus-4-6', label: 'Opus 4.6' },
] as const

const QuizForm: React.FC<{
  noteId: number
  onGenerated: (quiz: Quiz) => void
}> = ({ noteId, onGenerated }) => {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [numberOfQuestions, setNumberOfQuestions] = useState(10)
  const [extraInstructions, setExtraInstructions] = useState('')
  const [model, setModel] = useState<string>(MODELS[0].id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!text.trim()) {
      setError('Text is required')
      return
    }

    if (numberOfQuestions < 1 || numberOfQuestions > MAX_QUESTIONS) {
      setError(`Number of questions must be between 1 and ${MAX_QUESTIONS}`)
      return
    }

    setLoading(true)
    try {
      const res = await api.quizzes.generate(
        String(noteId),
        title.trim(),
        text.trim(),
        numberOfQuestions,
        extraInstructions.trim() || undefined,
        model,
      )
      onGenerated(res)
      setTitle('')
      setText('')
      setExtraInstructions('')
      setNumberOfQuestions(10)
    } catch {
      setError('Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="quiz-menu-form">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="quiz-title">Title</label>
          <input
            id="quiz-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-row form-row-flex">
          <label htmlFor="quiz-text">
            Text ({text.length}/{TEXT_MAX_LENGTH})
          </label>
          <textarea
            id="quiz-text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, TEXT_MAX_LENGTH))}
            maxLength={TEXT_MAX_LENGTH}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="quiz-num">
            Number of questions (max {MAX_QUESTIONS})
          </label>
          <input
            id="quiz-num"
            type="number"
            min={1}
            max={MAX_QUESTIONS}
            value={numberOfQuestions}
            onChange={(e) =>
              setNumberOfQuestions(
                Math.min(
                  MAX_QUESTIONS,
                  Math.max(1, parseInt(e.target.value) || 1),
                ),
              )
            }
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="quiz-model">Model</label>
          <select
            id="quiz-model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="quiz-extra">Extra instructions (optional)</label>
          <textarea
            id="quiz-extra"
            value={extraInstructions}
            onChange={(e) => setExtraInstructions(e.target.value)}
            rows={3}
          />
        </div>

        {error && <div className="quiz-error">{error}</div>}

        <div className="form-row add-btn">
          <Button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </Button>
        </div>
      </form>

      {loading && <Spinner />}
    </div>
  )
}

export default QuizForm

import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'slim-react-router'
import api from '../../api'
import { Quiz } from '../../types'
import Spinner from '../../ui/Spinner'

const LABELS = ['A', 'B', 'C', 'D']

const QuizPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!id) return
    const [noteId, quizId] = id.split('__')
    if (!noteId || !quizId) {
      setError('Invalid quiz URL')
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const data = await api.quizzes.get(noteId, quizId)
        setQuiz(data)
      } catch {
        setError('Quiz not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSelectAnswer = (answerIdx: number) => {
    if (revealed[currentIdx]) return
    setSelected((s) => ({ ...s, [currentIdx]: answerIdx }))
    setRevealed((r) => ({ ...r, [currentIdx]: true }))
  }

  // Auto-advance to next question after a short delay
  useEffect(() => {
    if (!quiz || !revealed[currentIdx]) return
    if (currentIdx >= quiz.items.length - 1) return

    const timer = setTimeout(() => {
      setCurrentIdx((i) => i + 1)
    }, 1200)

    return () => clearTimeout(timer)
  }, [revealed, currentIdx, quiz])

  const score = quiz
    ? quiz.items.filter((q, i) => selected[i] === q.correctIndex).length
    : 0
  const answered = Object.keys(revealed).length
  const finished = quiz ? answered === quiz.items.length : false

  if (loading) {
    return (
      <div className="quiz-page">
        <Spinner />
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="quiz-page">
        <div className="qp-container">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1) }} className="qp-back">
            <ArrowLeftIcon size={14} /> Back
          </a>
          <p className="qp-error">{error || 'Quiz not found'}</p>
        </div>
      </div>
    )
  }

  const item = quiz.items[currentIdx]
  const isRevealed = revealed[currentIdx]
  const wasCorrect = isRevealed && selected[currentIdx] === item.correctIndex

  return (
    <div className="quiz-page">
      <div className="qp-container">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(-1) }} className="qp-back">
          <ArrowLeftIcon size={14} /> Back
        </a>

        <div className="qp-top-bar">
          <h2>{quiz.title}</h2>
          <div className="qp-stats">
            <span className="qp-score">{score} correct</span>
            <span className="qp-separator">/</span>
            <span className="qp-answered">{answered} answered</span>
            <span className="qp-separator">/</span>
            <span className="qp-total">{quiz.items.length} total</span>
          </div>
          <div className="qp-progress-bar">
            <div
              className="qp-progress-fill"
              style={{ width: `${(answered / quiz.items.length) * 100}%` }}
            />
          </div>
        </div>

        {finished ? (
          <div className="qp-finished">
            <div className="qp-finished-score">{score}/{quiz.items.length}</div>
            <p className="qp-finished-label">
              {score === quiz.items.length
                ? 'Perfect score!'
                : score >= quiz.items.length * 0.7
                  ? 'Well done!'
                  : 'Keep studying!'}
            </p>
            <button className="qp-btn" onClick={() => navigate(-1)}>Done</button>
          </div>
        ) : (
          <div className="qp-card">
            <div className="qp-card-counter">
              Question {currentIdx + 1} of {quiz.items.length}
            </div>
            <p className="qp-card-question">{item.question}</p>

            <div className="qp-card-answers">
              {item.answers.map((a, ai) => {
                let cls = 'qp-card-answer'
                if (isRevealed) {
                  if (ai === item.correctIndex) cls += ' correct'
                  else if (ai === selected[currentIdx]) cls += ' wrong'
                  else cls += ' dimmed'
                }
                return (
                  <button
                    key={ai}
                    className={cls}
                    onClick={() => handleSelectAnswer(ai)}
                    disabled={isRevealed}
                  >
                    <span className="qp-card-answer-label">{LABELS[ai]}</span>
                    <span className="qp-card-answer-text">{a}</span>
                    {isRevealed && ai === item.correctIndex && (
                      <CheckCircleIcon size={16} className="qp-card-answer-icon" />
                    )}
                    {isRevealed && ai === selected[currentIdx] && ai !== item.correctIndex && (
                      <XCircleIcon size={16} className="qp-card-answer-icon" />
                    )}
                  </button>
                )
              })}
            </div>

            {isRevealed && (
              <div className={`qp-card-feedback ${wasCorrect ? 'correct' : 'wrong'}`}>
                {wasCorrect ? 'Correct!' : 'Incorrect'}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}

export default QuizPage

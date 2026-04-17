import { PlayIcon, PlusIcon, XIcon } from '@primer/octicons-react'
import { formatDistanceToNow } from 'date-fns'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'slim-react-router'
import api from '../../../api'
import { StateContext } from '../../../state/StateProvider'
import { Quiz, getLastQuizAttempt } from '../../../types'
import SidePanel from '../../SidePanel'
import AttemptsChart from './AttemptsChart'
import QuizForm from './QuizForm'

const Quizzes: React.FC<{ noteId: number; onCountChange?: (count: number) => void }> = ({ noteId, onCountChange }) => {
  const { quizzesVisible, toggleQuizzesVisible } = useContext(StateContext)
  const navigate = useNavigate()

  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const loadQuizzes = async () => {
      const data = await api.quizzes.list(noteId)
      setQuizzes(data)
    }
    loadQuizzes()
  }, [noteId])

  useEffect(() => {
    onCountChange?.(quizzes.length)
  }, [quizzes.length])

  const handleGenerated = (quiz: Quiz) => {
    setQuizzes((prev) => [quiz, ...prev])
    setShowForm(false)
  }

  return (
    <SidePanel
      visible={quizzesVisible}
      toggleVisible={toggleQuizzesVisible}
      className="quizzes-panel"
      onExitComplete={() => {
        setShowForm(false)
      }}
    >
      <h3>
        Quizzes
        {showForm && (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setShowForm(false)
            }}
            className="action-btn"
          >
            <XIcon />
          </a>
        )}
        {!showForm && (
          <a href="#" onClick={() => setShowForm(true)} className="action-btn">
            <PlusIcon />
          </a>
        )}
      </h3>

      {showForm && <QuizForm noteId={noteId} onGenerated={handleGenerated} />}

      {!showForm && (
        <>
          <div className="quiz-menu-list">
            {quizzes.map((q) => {
              const lastAttempt = getLastQuizAttempt(q)
              return (
              <div key={`${q.noteId}-${q.id}`} className="quiz-list-item">
                <div className="quiz-list-item-title">{q.title}</div>
                <div className="quiz-list-item-meta">
                  {q.items.length} questions
                  {lastAttempt && (
                    <>
                      {' · '}
                      <span className="quiz-list-item-score">
                        {lastAttempt.score}%
                      </span>
                      {' · '}
                      {formatDistanceToNow(new Date(lastAttempt.taken_at), {
                        addSuffix: true,
                      })}
                    </>
                  )}
                </div>
                {q.attempts && <AttemptsChart attempts={q.attempts} />}
                <a
                  href={`/quiz/${q.noteId}__${q.id}`}
                  className="quiz-list-item-take"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/quiz/${q.noteId}__${q.id}`)
                  }}
                >
                  <PlayIcon size={12} />
                  Take
                </a>
              </div>
              )
            })}
          </div>

          {quizzes.length === 0 && (
            <div className="quiz-menu-empty">
              <p>No quizzes yet.</p>
            </div>
          )}
        </>
      )}
    </SidePanel>
  )
}

export default Quizzes

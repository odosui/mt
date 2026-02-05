import { PlusIcon, XIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'slim-react-router'
import api from '../../../api'
import { StateContext } from '../../../state/StateProvider'
import { Quiz } from '../../../types'
import SidePanel from '../../SidePanel'
import QuizForm from './QuizForm'

const Quizzes: React.FC<{ noteId: number }> = ({ noteId }) => {
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

  const handleGenerated = (quiz: Quiz) => {
    setQuizzes([quiz, ...quizzes])
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
          <a href="#" onClick={(e) => { e.preventDefault(); setShowForm(false) }} className="action-btn">
            <XIcon />
          </a>
        )}
        {!showForm && (
          <a href="#" onClick={() => setShowForm(true)} className="action-btn">
            <PlusIcon />
          </a>
        )}
      </h3>

      {showForm && (
        <QuizForm noteId={noteId} onGenerated={handleGenerated} />
      )}

      {!showForm && (
        <>
          <div className="quiz-menu-list">
            {quizzes.map((q) => (
              <div
                key={`${q.noteId}-${q.id}`}
                className="quiz-list-item"
              >
                <div className="quiz-list-item-title">{q.title}</div>
                <div className="quiz-list-item-meta">
                  {q.items.length} questions
                </div>
                <a
                  href={`/quiz/${q.noteId}__${q.id}`}
                  className="quiz-list-item-take"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(`/quiz/${q.noteId}__${q.id}`)
                  }}
                >
                  Take
                </a>
              </div>
            ))}
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

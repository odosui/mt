import { PlusIcon, XIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import api from '../../../api'
import { StateContext } from '../../../state/StateProvider'
import { Question } from '../../../types'
import Spinner from '../../../ui/Spinner'
import pubsub from '../../../utils/pubsub'
import QuestionCard from '../../QuestionCard'
import FlashcardForm from './FlashcardForm'
import SidePanel from '../../SidePanel'

const Flashcards: React.FC<{ noteId: number }> = ({ noteId }) => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [showForm, setShowForm] = useState(false)

  const [initialQuestion, setInitialQuestion] = useState('')
  const [initialAnswer, setInitialAnswer] = useState('')

  const [aiLoading, setAiLoading] = useState(false)
  const [aiQs, setAiQs] = useState<
    { question: string; answer: string; id: string }[]
  >([])

  const { reloadCounters, flashcardsVisible, toggleFlashcardsVisible } =
    useContext(StateContext)

  useEffect(() => {
    const loadData = async () => {
      const d = await api.questions.list(noteId)
      setQuestions(d)
    }

    loadData()
  }, [noteId])

  const handleSubmit = async (question: string, answer: string) => {
    const q = await api.questions.create(noteId, question, answer)
    setQuestions([q, ...questions])
    reloadCounters()
  }

  const onDelete = (id: number) => {
    setQuestions(questions.filter((qq) => qq.id !== id))
  }

  const handleUpdate = (newQ: Question) => {
    setQuestions(questions.map((q) => (q.id === newQ.id ? newQ : q)))
  }

  const handleCloseForm = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowForm(false)
    setInitialAnswer('')
    setInitialQuestion('')
  }

  const handleAiCardSubmit = async (id: string) => {
    const aiq = aiQs.find((s) => s.id === id)
    if (!aiq) {
      return
    }

    const q = await api.questions.create(noteId, aiq.question, aiq.answer)
    setQuestions([q, ...questions])

    setAiQs(aiQs.filter((q) => q.id !== id))
    reloadCounters()
  }

  const handleAiCardDelete = (id: string) => {
    setAiQs(aiQs.filter((q) => q.id !== id))
  }

  useEffect(() => {
    const handleFlashcardFromAnswer = (text: string) => {
      setShowForm(true)
      setInitialAnswer(text)
    }

    const handleFlashcardFromQuestion = (text: string) => {
      setShowForm(true)
      setInitialQuestion(text)
    }

    const handleFlashcardsFromAI = async (text: string) => {
      setAiLoading(true)
      const qs = await api.questions.ai(text)
      console.log('qs', qs)
      setAiQs(qs.map((q) => ({ ...q, id: tmpId() })))
      setAiLoading(false)
    }

    pubsub.on('flashCardFromAnswer', handleFlashcardFromAnswer)
    pubsub.on('flashCardFromQuestion', handleFlashcardFromQuestion)
    pubsub.on('flashCardsFromAI', handleFlashcardsFromAI)

    return () => {
      pubsub.off('flashCardFromAnswer', handleFlashcardFromAnswer)
      pubsub.off('flashCardFromQuestion', handleFlashcardFromQuestion)
      pubsub.off('flashCardsFromAI', handleFlashcardsFromAI)
    }
  }, [])

  return (
    <SidePanel
      visible={flashcardsVisible}
      toggleVisible={toggleFlashcardsVisible}
      className="flashcards-panel"
      onExitComplete={() => setShowForm(false)}
    >
      <h3>
        Flashcards
        {showForm && (
          <a href="#" onClick={handleCloseForm} className="action-btn">
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
        <FlashcardForm
          onSubmit={handleSubmit}
          initialAnswer={initialAnswer}
          initialQuestion={initialQuestion}
        />
      )}
      <div className="quiz-menu-list">
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            q={q}
            onDelete={() => onDelete(q.id)}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {questions && questions.length === 0 && (
        <div className="quiz-menu-empty">
          <p>No flashcards yet.</p>
        </div>
      )}

      <div className="flashcards-ai">
        {aiLoading && <Spinner />}

        {!aiLoading && aiQs.length > 0 && (
          <>
            <div className="ai-note">
              Please, review and add the generated cards
            </div>
            <div className="flashcards-ai-list">
              {aiQs.map((q) => (
                <FlashcardForm
                  key={q.id}
                  onSubmit={() => handleAiCardSubmit(q.id)}
                  initialAnswer={q.answer}
                  initialQuestion={q.question}
                  onDelete={() => handleAiCardDelete(q.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </SidePanel>
  )
}

export default Flashcards

function tmpId() {
  return Math.random().toString(36).substring(7)
}

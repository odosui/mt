import { useEffect, useState } from 'react'
import api from '../api'
import Flashcard from '../components/Flashcard'
import { Question } from '../types'
import SwapTransition from '../ui/SwapTransition'

const CARD_SWAP_MS = 200

const FlashCardsMobile = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [mode, setMode] = useState<'review' | 'explore'>('review')

  async function loadData() {
    const d = await api.questions.listForReview()
    if (d.length > 0) {
      setMode('review')
      setQuestions(d)
      return
    }

    const dd = await api.questions.list()
    setQuestions(dd)
    setMode('explore')
  }

  const handleGood = () => {
    const [, ...rest] = questions
    if (rest.length === 0) {
      loadData()
    } else {
      setQuestions(rest)
    }
  }

  const handleBad = () => {
    const [first, ...rest] = questions
    if (!first) {
      return
    }
    setQuestions([...rest, first])
  }

  // const onCardDeleted = (id: number) => {
  //   setQuestions(questions.filter((q) => q.id !== id))
  // }

  useEffect(() => {
    loadData()
  }, [])

  const [question, ...rest] = questions || []

  return (
    <div className="mobile-page">
      <div className="flashcards-mobile">
        {mode == 'review' && question && (
          <div className="review-mode">
            <div className="stats">
              <div>
                <b>{rest.length}</b> cards left to review
              </div>
            </div>
            <SwapTransition
              itemKey={question.note_id + question.question}
              className="question-area"
              durationMs={CARD_SWAP_MS}
            >
              <Flashcard
                q={question}
                onReviewGood={handleGood}
                onReviewBad={handleBad}
              />
            </SwapTransition>
          </div>
        )}

        {mode === 'explore' && questions.length === 0 && (
          <div className="placeholder">
            Add flashcards from any note by click on the question mark.
          </div>
        )}

        {mode == 'explore' && (
          <div className="question-list">
            <div className="placeholder">Nothing to review.</div>

            {/*{questions.map((q) => (
              <QuestionCard
                q={q}
                key={q.question}
                onDelete={() => onCardDeleted(q.id)}
                // doesn't matter
                onUpdate={() => {}}
              />
                ))} */}
          </div>
        )}
      </div>
    </div>
  )
}

export default FlashCardsMobile

import { motion } from 'motion/react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import api from '../../api'
import Flashcard from '../../components/Flashcard'
import { Question } from '../../types'
import ExploreCards from './ExploreCards'

const FlashCards: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [mode, setMode] = useState<'review' | 'explore'>('review')

  async function loadData() {
    const d = await api.questions.listForReview()
    if (d.length > 0) {
      setMode('review')
      setQuestions(shuffle(d))
      return
    } else {
      setMode('explore')
    }
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

  useEffect(() => {
    loadData()
  }, [])

  const [question, ...rest] = questions || []

  return (
    <div className="page">
      <div className="flashcards-page">
        {mode == 'review' && question && (
          <div className="review-mode">
            <motion.div
              className="question-area"
              key={question?.question}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <Flashcard
                q={question}
                onReviewGood={handleGood}
                onReviewBad={handleBad}
              />
            </motion.div>
            <div className="stats">{rest.length} cards left</div>
          </div>
        )}

        {mode === 'explore' && <ExploreCards />}
      </div>
    </div>
  )
}

export default FlashCards

function shuffle<T>(array: T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = copy[i] as T
    copy[i] = copy[j] as T
    copy[j] = tmp
  }
  return copy
}

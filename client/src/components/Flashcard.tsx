import { CheckIcon, EyeIcon, SyncIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import api from '../api'
import { StateContext } from '../state/StateProvider'
import { Question } from '../types'
import Button from '../ui/Button'

const Flashcard: React.FC<{
  q: Question
  onReviewGood: () => void
  onReviewBad: () => void
}> = ({ q, onReviewGood, onReviewBad }) => {
  const [status, setStatus] = useState<'ask' | 'assess'>('ask')

  const { reloadCounters } = React.useContext(StateContext)

  const handleShowAnswer: React.MouseEventHandler = (e) => {
    e.preventDefault()
    setStatus('assess')
  }

  const handleGood: React.MouseEventHandler = async (e) => {
    e.preventDefault()
    await api.questions.reviewGood(q.note_id, q.question)
    reloadCounters()
    onReviewGood()
  }

  const handleBad: React.MouseEventHandler = async (e) => {
    e.preventDefault()
    await api.questions.reviewBad(q.note_id, q.question)
    reloadCounters()
    onReviewBad()
  }

  useEffect(() => {
    setStatus('ask')
  }, [q?.question])

  if (!q) return null

  return (
    <div className="review-card">
      {status === 'ask' && (
        <div className="inner">
          <div className="question">{q.question}</div>
          <div className="actions">
            <Button
              className="show-answer"
              icon={<EyeIcon />}
              onClick={handleShowAnswer}
            >
              SHOW ANSWER
            </Button>
          </div>
        </div>
      )}
      {status === 'assess' && (
        <div className="inner">
          <div className="question">{q.answer}</div>
          <div className="actions">
            <Button className="bad" icon={<SyncIcon />} onClick={handleBad}>
              AGAIN
            </Button>
            <Button className="good" icon={<CheckIcon />} onClick={handleGood}>
              GOOD - {q.days_till_review_after_current}d
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Flashcard

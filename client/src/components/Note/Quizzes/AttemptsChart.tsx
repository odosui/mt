import { formatDistanceToNow } from 'date-fns'
import * as React from 'react'
import { QuizAttempt } from '../../../types'

const MAX_BARS = 16

const AttemptsChart: React.FC<{ attempts: QuizAttempt[] }> = ({ attempts }) => {
  if (!attempts || attempts.length === 0) return null

  const recent = attempts.slice(-MAX_BARS).reverse()

  return (
    <div
      className="quiz-list-item-chart"
      aria-label={`${attempts.length} attempts`}
    >
      {recent.map((a, i) => (
        <div key={i} className="quiz-list-item-bar-wrap">
          <div
            className="quiz-list-item-dot"
            style={{
              background: `hsl(${Math.round(a.score * 1.2)}, 60%, 48%)`,
            }}
          />
          <div className="quiz-list-item-bar-tooltip">
            <strong>{a.score}%</strong>
            <span>
              {formatDistanceToNow(new Date(a.taken_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AttemptsChart

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
            className="quiz-list-item-bar"
            style={{
              height: `${Math.max(a.score, 3)}%`,
              background: `hsl(${Math.round(a.score * 1.2)}, 60%, 48%)`,
            }}
          />
          <div className="quiz-list-item-bar-tooltip">
            <strong>{a.score}%</strong>
            <span>
              {new Date(a.taken_at).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AttemptsChart

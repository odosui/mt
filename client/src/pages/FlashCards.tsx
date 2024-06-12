import * as React from 'react'
import { useEffect, useState } from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import SwitchTransition from 'react-transition-group/SwitchTransition'
import api from '../api'
import Flashcard from '../Flashcard'
import QuestionCard from '../QuestionCard'
import { Question } from '../types'
import { Tag } from '@mui/icons-material'

const FlashCards: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [mode, setMode] = useState<'review' | 'explore'>('review')

  async function loadData() {
    const d = await api.questions.listForReview()
    if (d.length > 0) {
      setMode('review')
      setQuestions(d)
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
            <div className="question-area">
              <SwitchTransition>
                <CSSTransition
                  key={question?.id}
                  addEndListener={(node, done) =>
                    node.addEventListener('transitionend', done, false)
                  }
                  classNames="aleft"
                >
                  <Flashcard
                    q={question}
                    onReviewGood={handleGood}
                    onReviewBad={handleBad}
                    key={question?.id}
                  />
                </CSSTransition>
              </SwitchTransition>
            </div>
            <div className="stats">{rest.length} cards left</div>
          </div>
        )}

        {mode === 'explore' && <ExploreCards />}
      </div>
    </div>
  )
}

const ExploreCards: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([])

  async function loadData() {
    const dd = await api.questions.list()
    setQuestions(dd)
  }

  const onCardDeleted = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  useEffect(() => {
    loadData()
  }, [])

  if (questions.length === 0) {
    return (
      <div className="placeholder">
        You can add question cards from any note by click on the question mark.
      </div>
    )
  }

  const groups = sortAlpha(groupQuestionsByTags(questions), (i) =>
    sortAlpha(i.tags, (t) => t).join(''),
  )

  return (
    <div className="question-list">
      {groups.map((g) => (
        <div className="group" id={g.tags.join('')}>
          <div className="group-head">
            {g.tags.length === 0 && <div className="tag">untagged</div>}
            {g.tags.map((t) => (
              <div className="tag">
                <Tag /> {t}
              </div>
            ))}
          </div>
          <div className="group-items">
            {g.items.map((q) => (
              <QuestionCard
                q={q}
                key={q.question}
                onDelete={() => onCardDeleted(q.id)}
                // doens't matter
                onUpdate={() => {}}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function groupQuestionsByTags(
  items: Question[],
): Array<{ tags: string[]; items: Question[] }> {
  const byTags: Record<string, Question[]> = {}
  items.forEach((q) => {
    const tagsKey = q.tags.sort().join(',')
    const g = byTags[tagsKey]
    if (!g) {
      byTags[tagsKey] = [q]
    } else {
      g.push(q)
    }
  })
  return Object.entries(byTags).map(([_tagsStr, items]) => ({
    tags: items[0]?.tags || [''],
    items,
  }))
}

function sortAlpha<T>(items: T[], key: (item: T) => string): T[] {
  return items.sort((a, b) => key(a).localeCompare(key(b)))
}

export default FlashCards

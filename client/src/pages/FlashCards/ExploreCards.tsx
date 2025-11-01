import * as React from 'react'
import { useEffect, useState } from 'react'
import api from '../../api'
import QuestionCard from '../../components/QuestionCard'
import { Question } from '../../types'
import { HashIcon } from '@primer/octicons-react'

const ExploreCards: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedTag, setSelectedTag] = useState<string>('All')

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

  // Get all unique tags from all questions
  const allTags = Array.from(new Set(questions.flatMap((q) => q.tags))).sort()

  // Filter questions based on selected tag
  const filteredQuestions =
    selectedTag === 'All'
      ? questions
      : selectedTag === 'untagged'
        ? questions.filter((q) => q.tags.length === 0)
        : questions.filter((q) => q.tags.includes(selectedTag))

  return (
    <div className="explore-cards-container">
      <div className="tags-sidebar">
        <div className="tag-list">
          <div
            className={`tag-item ${selectedTag === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedTag('All')}
          >
            All ({questions.length})
          </div>
          {allTags.map((tag) => {
            const count = questions.filter((q) => q.tags.includes(tag)).length
            return (
              <div
                key={tag}
                className={`tag-item ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                <HashIcon size={12} /> {tag} ({count})
              </div>
            )
          })}
          {questions.some((q) => q.tags.length === 0) && (
            <div
              className={`tag-item ${selectedTag === 'untagged' ? 'active' : ''}`}
              onClick={() => setSelectedTag('untagged')}
            >
              untagged ({questions.filter((q) => q.tags.length === 0).length})
            </div>
          )}
        </div>
      </div>

      <div className="cards-content">
        <div className="question-list">
          {filteredQuestions.map((q) => (
            <QuestionCard
              q={q}
              key={q.id}
              onDelete={() => onCardDeleted(q.id)}
              onUpdate={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExploreCards

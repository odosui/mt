import * as React from 'react'
import { useEffect, useState } from 'react'
import api from '../../api'
import QuestionCard from '../../components/QuestionCard'
import { Question } from '../../types'
import { HashIcon } from '@primer/octicons-react'

type StatusFilter = 'all' | 'active' | 'completed'

const ExploreCards: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedTag, setSelectedTag] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  async function loadData() {
    const dd = await api.questions.list()
    setQuestions(dd)
  }

  const onCardDeleted = (nid: string, qest: string) => {
    setQuestions(
      questions.filter((q) => !(q.note_id === nid && q.question === qest)),
    )
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

  // Filter by status first
  const statusFiltered =
    statusFilter === 'all'
      ? questions
      : statusFilter === 'completed'
        ? questions.filter((q) => q.completed)
        : questions.filter((q) => !q.completed)

  // Get all unique tags from status-filtered questions
  const allTags = Array.from(
    new Set(statusFiltered.flatMap((q) => q.tags)),
  ).sort()

  // Filter questions based on selected tag
  const filteredQuestions =
    selectedTag === 'All'
      ? statusFiltered
      : selectedTag === 'untagged'
        ? statusFiltered.filter((q) => q.tags.length === 0)
        : statusFiltered.filter((q) => q.tags.includes(selectedTag))

  return (
    <div className="explore-cards-container">
      <div className="tags-sidebar">
        <div className="filter-section">
          <div className="filter-title">Status</div>
          {(['all', 'active', 'completed'] as StatusFilter[]).map((status) => (
            <div
              key={status}
              className={`tag-item ${statusFilter === status ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter(status)
                setSelectedTag('All')
              }}
            >
              {status} (
              {status === 'all'
                ? questions.length
                : status === 'completed'
                  ? questions.filter((q) => q.completed).length
                  : questions.filter((q) => !q.completed).length}
              )
            </div>
          ))}
        </div>
        <div className="filter-section">
          <div className="filter-title">Tags</div>
          <div className="tag-list-scroll">
            <div
              className={`tag-item ${selectedTag === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedTag('All')}
            >
              All ({statusFiltered.length})
            </div>
            {allTags.map((tag) => {
              const count = statusFiltered.filter((q) =>
                (q.tags ?? []).includes(tag),
              ).length
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
            {statusFiltered.some((q) => (q.tags ?? []).length === 0) && (
              <div
                className={`tag-item ${selectedTag === 'untagged' ? 'active' : ''}`}
                onClick={() => setSelectedTag('untagged')}
              >
                untagged (
                {statusFiltered.filter((q) => (q.tags ?? []).length === 0).length}
                )
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cards-content">
        <div className="question-list">
          {filteredQuestions.map((q) => (
            <QuestionCard
              q={q}
              key={q.note_id + q.question}
              onDelete={() => onCardDeleted(q.note_id, q.question)}
              onUpdate={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExploreCards

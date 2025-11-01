import { XIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import AutoresizableTextarea from '../../../ui/AutoresizableTextarea'

const FlashcardForm: React.FC<{
  initialQuestion: string
  initialAnswer: string
  onSubmit: (question: string, answer: string) => void
  onDelete?: () => void
}> = ({ initialAnswer, initialQuestion, onSubmit, onDelete }) => {
  const [answer, setAnswer] = useState(initialAnswer)
  const [question, setQuestion] = useState(initialQuestion)

  const qRef = React.useRef<HTMLTextAreaElement>(null)
  const aRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault()

    if (!question || !answer) {
      return
    }

    setQuestion('')
    setAnswer('')

    qRef.current?.focus()

    onSubmit(question, answer)
  }

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion)
      aRef.current?.focus()
    }
  }, [initialQuestion])

  useEffect(() => {
    if (initialAnswer) {
      setAnswer(initialAnswer)
      qRef.current?.focus()
    }
  }, [initialAnswer])

  return (
    <div className="quiz-menu-form">
      {onDelete && (
        <button onClick={onDelete} className="del">
          <XIcon />
        </button>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="cquestion">Question</label>
          <AutoresizableTextarea
            id="cquestion"
            name="question"
            autoFocus={true}
            minHeight={48}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            ref={qRef}
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="canswer">Answer</label>
          <AutoresizableTextarea
            id="canswer"
            name="answer"
            minHeight={48}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            ref={aRef}
            required
          />
        </div>
        <div className="form-row add-btn">
          <button type="submit" className="btn">
            Add card
          </button>
        </div>
      </form>
    </div>
  )
}

export default FlashcardForm

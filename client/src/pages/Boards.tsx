import * as React from 'react'
import { IBoardSearch } from '../types'
import api from '../api'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

const Boards: React.FC<{}> = () => {
  const [boards, setBoards] = React.useState<IBoardSearch[]>([])

  async function loadBoards() {
    const bs = await api.boards.list()
    setBoards(bs)
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    if (!title) {
      return
    }

    const b = await api.boards.create(title)
    window.location.href = `/app/boards/${b.id}`
  }

  React.useEffect(() => {
    loadBoards()
  }, [])

  return (
    <div className="boards-page">
      <div className="board-list">
        {boards.map((b) => (
          <Link to={`/app/boards/${b.id}`} key={b.id}>
            <div className="board-list-item">
              <h3>{b.title}</h3>
              <div className="updated">{b.updated_at_in_words} ago</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="new-board-form">
        <form onSubmit={handleFormSubmit}>
          <input type="text" name="title" placeholder="Board title" required />
          <Button type="submit">Create</Button>
        </form>
      </div>
    </div>
  )
}

export default Boards

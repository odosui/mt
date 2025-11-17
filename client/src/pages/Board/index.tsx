import {
  ArrowRightIcon,
  DatabaseIcon,
  PlusIcon,
  ThreeBarsIcon,
  XIcon,
} from '@primer/octicons-react'
import { noop } from 'motion'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api'
import Editor from '../../components/Editor'
import Preview from '../../components/Preview'
import { IBoard, IImageMetas, INote } from '../../types'
import Button from '../../ui/Button'
import ClickOutside from '../../ui/ClickOutside'
import EditSwitch from '../../ui/EditSwitch'
import NoteSearch from './NoteSearch'
import useResizable from './useResizable'

const Board: React.FC<{}> = () => {
  const pars = useParams<{ id: string }>()

  const [board, setBoard] = React.useState<IBoard | null>(null)
  const [notes, setNotes] = React.useState({} as { [sid: number]: INote })

  async function loadNotes() {
    if (!board) return
    const sids = board.config.cols
      .map((col) => col.items.map((item) => item.sid))
      .flat()

    const res = await Promise.all(sids.map((sid) => api.notes.fetch(sid)))

    const notes = res.reduce(
      (acc, note) => {
        acc[note.sid] = note
        return acc
      },
      {} as { [sid: number]: INote },
    )

    setNotes(notes)
  }

  async function preloadNote(sid: number) {
    if (notes[sid]) return
    const note = await api.notes.fetch(sid)
    setNotes((notes) => ({ ...notes, [sid]: note }))
  }

  async function handleNoteSelected(uuid: string, sid: number) {
    if (!board) return

    await preloadNote(sid)

    const newCols = board.config.cols.map((col) => {
      if (col.uuid !== uuid) return col
      return {
        ...col,
        items: [...col.items, { sid }],
      }
    })

    const newBoard: IBoard = {
      ...board,
      config: {
        ...board.config,
        cols: newCols,
      },
    }

    setBoard(newBoard)
    api.boards.update(newBoard.id, newBoard.config)
  }

  async function loadBoard(id: string) {
    const board = await api.boards.fetch(id)
    setBoard(board)
  }

  function handleAddColumn() {
    if (!board) return
    const newCols = [...board.config.cols, { uuid: getUuid(), items: [] }]
    const newBoard = {
      ...board,
      config: {
        ...board.config,
        cols: newCols,
      },
    }

    setBoard(newBoard)
    api.boards.update(newBoard.id, newBoard.config)
  }

  function handleDeleteColumn(uuid: string) {
    if (!board) return
    const newCols = board.config.cols.filter((col) => col.uuid !== uuid)
    const newBoard = {
      ...board,
      config: {
        ...board.config,
        cols: newCols,
      },
    }

    setBoard(newBoard)
    api.boards.update(newBoard.id, newBoard.config)
  }

  function handleDeleteItem(uuid: string, sid: number) {
    if (!confirm('Are you sure you want to delete this note?')) return

    if (!board) return
    const newCols = board.config.cols.map((col) => {
      if (col.uuid !== uuid) return col
      return {
        ...col,
        items: col.items.filter((item) => item.sid !== sid),
      }
    })

    const newBoard: IBoard = {
      ...board,
      config: {
        ...board.config,
        cols: newCols,
      },
    }

    setBoard(newBoard)
    api.boards.update(newBoard.id, newBoard.config)
  }

  function handleResize(uuid: string, sid: number, height: number | 'full') {
    if (!board) return
    const newCols = board.config.cols.map((col) => {
      if (col.uuid !== uuid) return col
      return {
        ...col,
        items: col.items.map((item) => {
          if (item.sid !== sid) return item
          return {
            ...item,
            height,
          }
        }),
      }
    })

    const newBoard: IBoard = {
      ...board,
      config: {
        ...board.config,
        cols: newCols,
      },
    }

    setBoard(newBoard)
    api.boards.update(newBoard.id, newBoard.config)
  }

  useEffect(() => {
    if (!pars.id) return
    loadBoard(pars.id)
  }, [pars.id])

  useEffect(() => {
    if (!board?.id) return
    loadNotes()
  }, [board?.id])

  if (!board) return null

  const saveFn = async (sid: number, body: string) => {
    const updatedNote = await api.notes.update(sid, body)
    setNotes((notes) => ({ ...notes, [sid]: updatedNote }))
  }

  return (
    <div className="board-page">
      <header className="board-header"></header>
      <main className="board-main">
        {board.config.cols.map((col, i) => (
          <div
            className={`board-col ${col.items.length === 0 ? 'empty' : ''}`}
            key={i}
          >
            {col.items.map((item) => (
              <BoardItem
                sid={item.sid}
                key={item.sid}
                body={notes[item.sid]?.body ?? ''}
                imageMetas={notes[item.sid]?.image_metas ?? {}}
                onDelete={() => handleDeleteItem(col.uuid, item.sid)}
                height={item.height ?? 'full'}
                onResize={(h: number | 'full') =>
                  handleResize(col.uuid, item.sid, h)
                }
                saveFn={async (body) => await saveFn(item.sid, body)}
              />
            ))}

            <NoteSearch
              onSelected={(sid) => handleNoteSelected(col.uuid, sid)}
            />

            {col.items.length === 0 && (
              <div className="delete-col">
                <Button
                  variant="danger"
                  className="lite"
                  onClick={() => handleDeleteColumn(col.uuid)}
                  icon={<XIcon />}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        ))}
        <div className="new-col" onClick={handleAddColumn}>
          <p>
            <PlusIcon />
            Add Column
          </p>
        </div>
      </main>
    </div>
  )
}

const BoardItem: React.FC<{
  sid: number
  body: string
  height: number | 'full'
  onDelete: () => void
  onResize: (arg: number | 'full') => void
  saveFn: (body: string) => Promise<void>
  imageMetas: IImageMetas
}> = ({
  sid,
  body,
  onDelete,
  height: initialHeight,
  onResize,
  saveFn,
  imageMetas,
}) => {
  const itemRef = React.useRef<HTMLDivElement>(null)
  const resizeRef = React.useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  console.log('setPending', setPending, saveFn)

  const handleModeChange = (mode: 'view' | 'edit') => {
    setMode(mode)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  useResizable(itemRef, resizeRef, initialHeight, onResize)

  function handleGoto() {
    window.location.href = `/app/notes/${sid}`
  }

  return (
    <div className="board-item" ref={itemRef}>
      <div className="board-item-menu">
        <div className="left">
          <div className="edit-toggle">
            <EditSwitch
              value={mode}
              onChange={handleModeChange}
              saving={false}
            />
          </div>

          <DatabaseIcon className={`save ${pending ? 'pending' : ''}`} />
        </div>

        <div className={`menu-icon dropdown-menu-icon ${open ? 'open' : ''}`}>
          <div onClick={handleOpen}>
            <ThreeBarsIcon />
          </div>

          <ClickOutside onClickOutside={() => setOpen(false)}>
            {open && (
              <div className="dropdown-menu">
                <div
                  className="menu-item"
                  onClick={() => {
                    setOpen(false)
                    handleGoto()
                  }}
                >
                  <ArrowRightIcon />
                  Go to note
                </div>
                <div
                  className="menu-item"
                  onClick={() => {
                    setOpen(false)
                    onDelete()
                  }}
                >
                  <XIcon />
                  Delete
                </div>
              </div>
            )}
          </ClickOutside>
        </div>
      </div>
      <div className="board-item-body">
        <div className="note-editor-body" ref={itemRef}>
          {mode === 'view' && (
            <Preview markdown={body} imageMetas={imageMetas} />
          )}
          {mode === 'edit' && (
            <Editor initialText={body} onChange={noop} key={sid} />
          )}
        </div>
      </div>
      <div ref={resizeRef} className="resize-handle"></div>
    </div>
  )
}

export default Board

function getUuid() {
  return Math.random().toString(36).substring(7)
}

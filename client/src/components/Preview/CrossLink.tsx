import * as React from 'react'
import { useContext } from 'react'
import { StateContext } from '../../state/StateProvider'

const CrossLink: React.FC<{ noteId: string; children: React.ReactNode }> = ({
  children,
  noteId,
}) => {
  const { loadPreviewNote } = useContext(StateContext)

  const handleClick: React.MouseEventHandler = (e) => {
    e.preventDefault()
    loadPreviewNote(parseInt(noteId, 10))
  }

  return (
    <a href="#" className="cross-link" onClick={handleClick}>
      {children}
    </a>
  )
}

export default CrossLink

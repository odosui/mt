import * as React from 'react'
import { useContext } from 'react'
import { Link } from 'slim-react-router'
import { StateContext } from '../../../state/StateProvider'
import { NoteRef } from '../../../types'
import SidePanel from '../../SidePanel'

const Backlinks: React.FC<{ backlinks: NoteRef[] }> = ({ backlinks }) => {
  const { backlinksVisible, toggleBacklinksVisible } = useContext(StateContext)

  return (
    <SidePanel
      visible={backlinksVisible}
      toggleVisible={toggleBacklinksVisible}
      className="backlinks-panel"
    >
      <h3>Linked from</h3>

      {backlinks.length === 0 && (
        <div className="backlinks-empty">
          <p>No notes link here yet.</p>
        </div>
      )}

      <nav aria-label="Linked from" className="backlinks-list">
        {backlinks.map((ref) => (
          <Link
            key={ref.sid}
            to={`/app/notes/${ref.sid}`}
            className="backlinks-item"
          >
            <span className="backlinks-item-title">{ref.title}</span>
            <span className="backlinks-item-id">#{ref.sid}</span>
          </Link>
        ))}
      </nav>
    </SidePanel>
  )
}

export default Backlinks

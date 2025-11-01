import * as React from 'react'
import { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { StateContext } from '../state/StateProvider'
import Spinner from '../ui/Spinner'
import { XIcon } from '@primer/octicons-react'

const SideMenu: React.FC<{ open: boolean; onHide: () => void }> = ({
  open,
  onHide,
}) => {
  const { tags } = useContext(StateContext)

  const location = useLocation()

  const isActiveTag = (title: string) => {
    const urlParams = new URLSearchParams(location.search)
    const searchTag = urlParams.get('tag')
    return title === searchTag
  }

  return (
    <div className={`side-menu ${open ? 'open' : ''}`}>
      <div className="top">
        <div onClick={onHide}>
          <XIcon />
        </div>
      </div>
      <div className="content">
        <div className="tags-area">
          <h3>Tag</h3>
          {tags.loading && <Spinner />}
          <div className="items">
            {(tags.data || []).map((t) => (
              <NavLink
                key={t.title}
                to={`/app/notes?tag=${t.title}`}
                onClick={onHide}
                className={() =>
                  isActiveTag(t.title) ? 'active item' : 'item'
                }
              >
                <div className="tag-name">{t.title}</div>
                <div className="tag-count">{t.count}</div>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      <div className="bottom"></div>
    </div>
  )
}

export default SideMenu

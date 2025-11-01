import {
  CalendarIcon,
  FlameIcon,
  GearIcon,
  HashIcon,
  HomeIcon,
  NoteIcon,
  ProjectRoadmapIcon,
  SearchIcon,
  SignOutIcon,
  StarIcon,
  SyncIcon,
} from '@primer/octicons-react'
import * as React from 'react'
import { useContext, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { StateContext } from '../state/StateProvider'

const Sidebar: React.FC = () => {
  const [tagTerm, setTagTerm] = useState('')

  const {
    reviewCount,
    tags,
    focusMode,
    questionsCount,
    totalNoteCount,
    timelineCount,
  } = useContext(StateContext)

  const location = useLocation()

  const filteredTags = tags.loading
    ? []
    : (tags.data || []).filter((t) =>
        t.title.toLowerCase().includes(tagTerm.toLowerCase()),
      )

  const isActiveTag = (title: string) => {
    const urlParams = new URLSearchParams(location.search)
    const searchTag = urlParams.get('tag')
    return title === searchTag
  }

  return (
    <aside className={`menu ${focusMode ? 'meditation' : ''}`}>
      <h3 className="section">KNOWLEDGE BASE</h3>
      <div className="menu-item">
        <NavLink
          to="/app/notes"
          className={({ isActive }) => (isActive ? 'active' : '')}
          style={{ justifyContent: 'space-between' }}
        >
          <div>
            <HomeIcon />
            Notes
          </div>
          <div className="menu-item-count secondary">
            <span>{totalNoteCount}</span>
          </div>
        </NavLink>
      </div>

      <div className="menu-item">
        <NavLink
          to={`/app/fav`}
          className={({ isActive }) => (isActive ? 'active' : '')}
          style={{ justifyContent: 'space-between' }}
        >
          <div>
            <StarIcon />
            Favorites
          </div>
          <div className="menu-item-count"></div>
        </NavLink>
      </div>

      <div className="menu-item">
        <NavLink
          to={`/app/review`}
          className={({ isActive }) => (isActive ? 'active' : '')}
          style={{ justifyContent: 'space-between' }}
        >
          <div>
            <SyncIcon />
            Review
          </div>
          <div className="menu-item-count">
            <span>{reviewCount}</span>
          </div>
        </NavLink>
      </div>
      <div className="menu-item">
        <NavLink
          to={`/app/quiz`}
          className={({ isActive }) => (isActive ? 'active' : '')}
          style={{ justifyContent: 'space-between' }}
        >
          <div>
            <NoteIcon />
            Flashcards
          </div>
          <div className="menu-item-count">
            {(questionsCount || 0) > 0 && <span>{questionsCount}</span>}
          </div>
        </NavLink>
      </div>
      <div className="menu-item">
        <NavLink
          to={`/app/boards`}
          className={({ isActive }) => (isActive ? 'active' : '')}
          style={{ justifyContent: 'space-between' }}
        >
          <div>
            <ProjectRoadmapIcon />
            Boards
          </div>
          <div className="menu-item-count"></div>
        </NavLink>
      </div>
      <div className="menu-item">
        <NavLink
          to={`/app/timeline`}
          className={({ isActive }) => (isActive ? 'active' : '')}
          style={{ justifyContent: 'space-between' }}
        >
          <div>
            <CalendarIcon />
            Timeline
          </div>
          <div className="menu-item-count secondary">
            <span>{timelineCount}</span>
          </div>
        </NavLink>
      </div>
      <h3 className="section section-tags">TAGS</h3>
      <div className="menu-tags">
        <div className="tags-search">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search tags"
            value={tagTerm}
            onChange={(e) => setTagTerm(e.target.value)}
          />
        </div>
        <div className="tags-items">
          {(filteredTags || []).length === 0 && (
            <div className="plch">No tags added</div>
          )}
          {filteredTags.map((t) => (
            <NavLink
              key={t.title}
              to={`/app/notes?tag=${t.title}`}
              className={() => (isActiveTag(t.title) ? 'active item' : 'item')}
            >
              <div className="tag-and-icon">
                <HashIcon />
                <div
                  className="tag-name"
                  dangerouslySetInnerHTML={{
                    __html: fmt(t.title, tagTerm),
                  }}
                ></div>
              </div>
              <div className="tag-count">{t.count}</div>
            </NavLink>
          ))}
        </div>
      </div>
      <div className="menu-item settings-link">
        <NavLink
          to={`/app/settings`}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <div>
            <GearIcon />
            Settings
          </div>
        </NavLink>
      </div>
      <div className="menu-item settings-link"></div>
    </aside>
  )
}

function fmt(title: string, term: string) {
  if (!term || !title) {
    return title
  }
  return title.replace(new RegExp(`(${term})`, 'i'), '<mark>$1</mark>')
}

export default Sidebar

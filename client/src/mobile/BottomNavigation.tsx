import {
  CalendarIcon,
  HomeIcon,
  NoteIcon,
  SyncIcon,
} from '@primer/octicons-react'
import * as React from 'react'
import { useContext } from 'react'
import { NavLink, useLocation } from 'slim-react-router'
import { StateContext } from '../state/StateProvider'

const MobildBottomNavigation: React.FC = () => {
  const { reviewCount, questionsCount } = useContext(StateContext)

  return (
    <div className="mobile-bottom-menu">
      <NavItem path="/app/notes" title="Notes" icon={<HomeIcon />} />
      <NavItem
        path="/app/review"
        title="Review"
        icon={<SyncIcon />}
        counter={reviewCount || 0}
      />
      <NavItem path="/app/timeline" title="Timeline" icon={<CalendarIcon />} />
      <NavItem
        path="/app/flashcards"
        title="Cards"
        icon={<NoteIcon />}
        counter={questionsCount || 0}
      />
    </div>
  )
}

const NavItem: React.FC<{
  path: string
  icon: any
  title: string
  counter?: number
}> = ({ path, icon, title, counter }) => {
  const location = useLocation()
  const { pathname } = location
  return (
    <NavLink to={path} className={cl(pathname, path)}>
      <div className="icon">
        {icon}
        {counter !== undefined && counter > 0 && (
          <span className="counter">{counter > 99 ? '99+' : counter}</span>
        )}
      </div>
      <div className="title">{title}</div>
    </NavLink>
  )
}

function cl(pathname: string, prefix: string) {
  return pathname.startsWith(prefix) ? 'item active' : 'item'
}

export default MobildBottomNavigation

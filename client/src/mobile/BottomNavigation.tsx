import {
  CalendarIcon,
  GearIcon,
  HomeIcon,
  NoteIcon,
  SignOutIcon,
  SyncIcon,
} from '@primer/octicons-react'
import * as React from 'react'
import { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
      <NavItem
        path="/app/flashcards"
        title="Flashcards"
        icon={<NoteIcon />}
        counter={questionsCount || 0}
      />
      <NavItem path="/app/timeline" title="Timeline" icon={<CalendarIcon />} />
      <NavItem path="/app/settings" title="Settings" icon={<GearIcon />} />
      <NavItem path="/app/logout" title="Log out" icon={<SignOutIcon />} />
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
      {icon}
      <div className={`title ${counter && counter > 0 ? 'with-counter' : ''}`}>
        {title}
        {counter !== undefined && counter > 0 && (
          <span className="counter">{counter}</span>
        )}
      </div>
    </NavLink>
  )
}

function cl(pathname: string, prefix: string) {
  return pathname.startsWith(prefix) ? 'item active' : 'item'
}

export default MobildBottomNavigation

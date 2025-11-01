import * as React from 'react'
import { useContext, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { StateContext } from '../state/StateProvider'
import SideMenu from './SideMenu'
import {
  ArrowLeftIcon,
  SearchIcon,
  ThreeBarsIcon,
} from '@primer/octicons-react'

const TopNav: React.FC = () => {
  const { sid } = useContext(StateContext)
  const isNotePath = location.pathname.match(/\/app\/notes\/\d+/)

  const loc = useLocation()
  const urlParams = new URLSearchParams(loc.search)
  const tag = urlParams.get('tag')

  const [showSideMenu, setShowSideMenu] = useState(false)

  const showBackLink = (isNotePath && sid) || (!isNotePath && tag)

  return (
    <div className={`mobile-top-menu`}>
      <div className="menu-left">
        {showBackLink && (
          <NavLink to="/app/notes" className="back-link">
            <ArrowLeftIcon />
          </NavLink>
        )}
        {!showBackLink && (
          <>
            <SideMenu
              open={showSideMenu}
              onHide={() => setShowSideMenu(false)}
            />
            <div onClick={() => setShowSideMenu(true)}>
              <ThreeBarsIcon />
            </div>
          </>
        )}
      </div>
      <div className="menu-center">
        {isNotePath && sid && <>#{sid}</>}

        {(!isNotePath || !sid) && !tag && 'R E T A I N D'}
        {!isNotePath && tag && <>#{tag}</>}
      </div>
      <div className="menu-right">
        <SearchIcon />
      </div>
    </div>
  )
}
export default TopNav

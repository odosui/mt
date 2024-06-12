import MenuIcon from '@mui/icons-material/Menu'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Search from '@mui/icons-material/Search'
import * as React from 'react'
import { useContext, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { StateContext } from '../state/StateProvider'
import SideMenu from './SideMenu'

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
            <ArrowBack />
          </NavLink>
        )}
        {!showBackLink && (
          <>
            <SideMenu
              open={showSideMenu}
              onHide={() => setShowSideMenu(false)}
            />
            <MenuIcon onClick={() => setShowSideMenu(true)} />
          </>
        )}
      </div>
      <div className="menu-center">
        {isNotePath && sid && <>#{sid}</>}

        {(!isNotePath || !sid) && !tag && 'R E T A I N D'}
        {!isNotePath && tag && <>#{tag}</>}
      </div>
      <div className="menu-right">
        <Search />
      </div>
    </div>
  )
}
export default TopNav

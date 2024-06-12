import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import BottomNavigation from './mobile/BottomNavigation'
import FlashCardsMobile from './mobile/FlashcardsMobile'
import NoteMobile from './mobile/NoteMobile'
import NotesMobile from './mobile/NotesMobile'
import TopNavigation from './mobile/TopNavigation'

const MobileApp: React.FC = () => {
  const location = useLocation()

  return (
    <div className="mobile-app">
      <TopNavigation />
      <div className="mobile-content">
        <Routes location={location}>
          <Route path="/app/notes" element={<NotesMobile review={false} />} />
          <Route path="/app/review" element={<NotesMobile review={true} />} />
          <Route path="/app/notes/:sid" element={<NoteMobile />} />
          <Route path="/app/flashcards" element={<FlashCardsMobile />} />
        </Routes>
      </div>
      <BottomNavigation />
    </div>
  )
}

export default MobileApp

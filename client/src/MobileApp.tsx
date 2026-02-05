import React from 'react'
import { Route, Routes } from 'slim-react-router'
import BottomNavigation from './mobile/BottomNavigation'
import FlashCardsMobile from './mobile/FlashcardsMobile'
import NoteMobile from './mobile/NoteMobile'
import NotesMobile from './mobile/NotesMobile'
import TimelineMobile from './mobile/TimelineMobile'
import TopNavigation from './mobile/TopNavigation'
import QuizPage from './pages/QuizPage'

const MobileApp: React.FC = () => {
  return (
    <div className="mobile-app">
      <TopNavigation />
      <div className="mobile-content">
        <Routes>
          <Route path="/app/notes" element={<NotesMobile review={false} />} />
          <Route path="/app/review" element={<NotesMobile review={true} />} />
          <Route path="/app/notes/:sid" element={<NoteMobile />} />
          <Route path="/app/flashcards" element={<FlashCardsMobile />} />
          <Route path="/app/timeline" element={<TimelineMobile />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
      </div>
      <BottomNavigation />
    </div>
  )
}

export default MobileApp

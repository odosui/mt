import * as React from 'react'
import { Route, Routes } from 'react-router-dom'
import Sidebar from './Sidebar'
import FlashCards from './pages/FlashCards'
import Notes from './pages/Notes'

const DesktopApp: React.FC = () => {
  return (
    <div className="desktop-app">
      <Sidebar />
      <Routes>
        <Route path="/app/notes" element={<Notes mode="all" />} />
        <Route path="/app/notes/:sid" element={<Notes mode="all" />} />
        <Route path="/app/fav" element={<Notes mode="fav" />} />
        <Route path="/app/fav/:sid" element={<Notes mode="fav" />} />
        <Route path="/app/review" element={<Notes mode="review" />} />
        <Route path="/app/review/:sid" element={<Notes mode="review" />} />
        <Route path="/app/quiz" element={<FlashCards />} />
        {/*
        <Route path="/app/boards" element={<Boards />} />
        <Route path="/app/boards/:id" element={<Board />} /> */}
      </Routes>
    </div>
  )
}

export default DesktopApp

import * as React from 'react'
import { useEffect } from 'react'
import { Route, Routes, useNavigate } from 'slim-react-router'
import Sidebar from './components/Sidebar'
import FlashCards from './pages/FlashCards'
import Notes from './pages/Notes'
import QuizPage from './pages/QuizPage'
import Settings from './pages/Settings'
import Timeline from './pages/Timeline'

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
        <Route path="/app/settings" element={<Settings />} />
        <Route path="/app/quiz" element={<FlashCards />} />
        <Route path="/app/timeline" element={<Timeline />} />
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/" element={<Redirect to="/app/notes" />} />
      </Routes>
    </div>
  )
}

const Redirect: React.FC<{ to: string }> = ({ to }) => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to, { replace: true })
  }, [to])
  return null
}

export default DesktopApp

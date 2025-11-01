import * as React from 'react'
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import Sidebar from './Sidebar'
import FlashCards from './pages/FlashCards'
import Notes from './pages/Notes'
import { StateProvider } from './state/StateProvider'

const App: React.FC = () => {
  return (
    <Router>
      <StateProvider>
        <div className="desktop-app">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Navigate replace to="/app/notes" />} />
            <Route path="/app/notes" element={<Notes mode="all" />} />
            <Route path="/app/notes/:sid" element={<Notes mode="all" />} />
            <Route path="/app/fav" element={<Notes mode="fav" />} />
            <Route path="/app/fav/:sid" element={<Notes mode="fav" />} />
            <Route path="/app/review" element={<Notes mode="review" />} />
            <Route path="/app/review/:sid" element={<Notes mode="review" />} />
            <Route path="/app/quiz" element={<FlashCards />} />
            {/* by default go to /app/notes */}
            {/*
        <Route path="/app/boards" element={<Boards />} />
        <Route path="/app/boards/:id" element={<Board />} /> */}
          </Routes>
        </div>
      </StateProvider>
    </Router>
  )
}

export default App

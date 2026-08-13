import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Focus from './pages/Focus'
import History from './pages/History'
import Practice from './pages/Practice'
import Syllabus from './pages/Syllabus'
import ImportQuestions from './pages/ImportQuestions'
import Revision from './pages/Revision'
import Flashcards from './pages/Flashcards'
import Notes from './pages/Notes'
import Mistakes from './pages/Mistakes'
import MockTests from './pages/MockTests'
import Goals from './pages/Goals'
import Progress from './pages/Progress'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/history" element={<History />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/import" element={<ImportQuestions />} />
        <Route path="/revision" element={<Revision />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/mistakes" element={<Mistakes />} />
        <Route path="/mock-tests" element={<MockTests />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/progress" element={<Progress />} />

        <Route
          path="*"
          element={<Dashboard />}
        />
      </Route>
    </Routes>
  )
}

export default App


import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Focus from './pages/Focus'
import History from './pages/History'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Focus from './pages/Focus'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/focus" element={<Focus />} />
      </Route>
    </Routes>
  )
}

export default App
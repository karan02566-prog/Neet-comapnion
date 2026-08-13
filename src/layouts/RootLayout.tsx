import { Outlet } from 'react-router-dom'
import Nav from '../components/Nav'
import Text from '../components/ui/Text'
import Mascot from '../components/mascot/Mascot'

function RootLayout() {
  return (
    <div className="min-h-screen bg-paper text-ink border-x border-line max-w-[1400px] mx-auto flex flex-col">
      <header className="relative border-b border-line px-6 py-4 flex items-center justify-between">
        <Text variant="meta">NEET Study Companion</Text>
        <Nav />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bob — global study companion */}
      <Mascot />
    </div>
  )
}

export default RootLayout
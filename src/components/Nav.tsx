import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/planner', label: 'Planner' },
]
function Nav() {
  const [open, setOpen] = useState(false)
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors ${isActive ? 'text-accent' : 'text-neutral hover:text-ink'}`
  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex gap-6">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      {/* Mobile toggle */}
      <button
        className="md:hidden text-ink"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden absolute top-[57px] left-0 right-0 bg-paper border-b border-line px-6 py-4 flex flex-col gap-4 z-10">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}
export default Nav

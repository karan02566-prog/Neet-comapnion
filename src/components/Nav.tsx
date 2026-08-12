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
    [
      'relative text-sm transition-colors duration-200',
      'after:absolute after:-bottom-1 after:left-0 after:h-px',
      'after:bg-accent after:transition-all after:duration-200',
      isActive
        ? 'text-accent after:w-full'
        : 'text-neutral hover:text-ink after:w-0 hover:after:w-full',
    ].join(' ')

  return (
    <>
      {/* Desktop navigation */}
      <nav className="hidden md:flex items-center gap-7">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={linkClass}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile toggle */}
      <button
        type="button"
        className="md:hidden flex h-9 w-9 items-center justify-center text-neutral transition-colors duration-200 hover:text-accent"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={19} strokeWidth={1.7} /> : <Menu size={19} strokeWidth={1.7} />}
      </button>

      {/* Mobile navigation */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-line bg-paper/95 px-6 py-5 backdrop-blur-sm md:hidden">
          <nav className="flex flex-col gap-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    'text-sm transition-colors duration-200',
                    isActive
                      ? 'text-accent'
                      : 'text-neutral hover:text-ink',
                  ].join(' ')
                }
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

export default Nav
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" onClick={close}>
          <div className="brand-logo-wrap" role="img" aria-label="SCS Cougars"></div>
        </NavLink>
      </div>
      <button
        className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li><NavLink to="/" onClick={close}>Home</NavLink></li>
        <li><NavLink to="/roster" onClick={close}>Roster</NavLink></li>
        <li><NavLink to="/schedule" onClick={close}>Schedule</NavLink></li>
        <li><NavLink to="/performance" onClick={close}>Performance</NavLink></li>
        <li><NavLink to="/records" onClick={close}>Records</NavLink></li>
      </ul>
    </nav>
  )
}

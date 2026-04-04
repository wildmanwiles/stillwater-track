import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { isCoach } from '../utils/auth'
import './Navbar.css'

export default function Navbar({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)
  const coach = isCoach()

  function handleLogout() {
    close()
    onLogout()
  }

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
        <li><NavLink to="/results" onClick={close}>Results</NavLink></li>
        <li><NavLink to="/gallery" onClick={close}>Gallery</NavLink></li>
        <li><NavLink to="/practice" onClick={close}>Practice</NavLink></li>
        <li><NavLink to="/records" onClick={close}>Records</NavLink></li>
        {coach && (
          <li className="nav-admin"><NavLink to="/admin" onClick={close} className="nav-admin-link">
            <svg className="nav-admin-icon" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fillRule="evenodd" d="M10 1l3.09 1.545a8 8 0 010 14.91L10 19l-3.09-1.545a8 8 0 010-14.91L10 1zm0 2.07L7.68 4.3a6 6 0 000 11.4L10 16.93l2.32-1.23a6 6 0 000-11.4L10 3.07z" clipRule="evenodd" />
            </svg>
            Admin Panel
          </NavLink></li>
        )}
        {coach && <li className="nav-admin-badge-item"><span className="nav-admin-badge">Admin</span></li>}
        <li className="nav-about"><NavLink to="/about" onClick={close}>About This App</NavLink></li>
        <li className="nav-logout"><button onClick={handleLogout} className="logout-btn">Log Out</button></li>
      </ul>
    </nav>
  )
}

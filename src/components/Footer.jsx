import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-col footer-school">
          <h3 className="footer-heading">Stillwater Christian School</h3>
          <a href="https://www.google.com/maps/search/?api=1&query=255+FFA+Dr+Kalispell+MT+59901" target="_blank" rel="noopener noreferrer" className="footer-address-link">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            255 F.F.A. Dr, Kalispell, MT 59901
          </a>
          <p className="footer-motto">Home of the Cougars</p>
        </div>

        <div className="footer-col footer-links">
          <h3 className="footer-heading">Quick Links</h3>
          <ul>
            <li><a href="https://www.stillwaterchristianschool.org/" target="_blank" rel="noopener noreferrer">SCS Website</a></li>
            <li><a href="https://www.stillwaterchristianschool.org/athletics/" target="_blank" rel="noopener noreferrer">SCS Athletics</a></li>
            <li><a href="https://www.stillwaterchristianschool.org/athletics/athletic-resources/" target="_blank" rel="noopener noreferrer">Athletic Resources &amp; Forms</a></li>
            <li><a href="https://www.athletic.net/school/StillwaterChristian" target="_blank" rel="noopener noreferrer">Athletic.net Team Page</a></li>
            <li><Link to="/about">About This App</Link></li>
          </ul>
        </div>

        <div className="footer-col footer-connect">
          <h3 className="footer-heading">Connect</h3>
          <a href="https://www.facebook.com/scscougars/" target="_blank" rel="noopener noreferrer" className="footer-social">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            SCS Cougars on Facebook
          </a>
          <p className="footer-contact">
            Contact the Athletic Department through the{' '}
            <a href="https://www.stillwaterchristianschool.org/athletics/" target="_blank" rel="noopener noreferrer">school website</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Stillwater Christian School &mdash; Cougars Track &amp; Field</p>
        <p className="footer-built">Built with purpose for SCS athletes, families, and coaches</p>
      </div>
    </footer>
  )
}

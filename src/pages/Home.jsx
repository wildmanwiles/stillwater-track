import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isCoach } from '../utils/auth'
import announcements from '../data/announcements.json'
import schedule from '../data/schedule.json'
import './Home.css'

function getCountdownText(meetDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const meet = new Date(meetDate + 'T00:00:00')
  meet.setHours(0, 0, 0, 0)
  const diffMs = meet - today
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return { text: 'TODAY!', type: 'today' }
  if (diffDays === 1) return { text: 'TOMORROW!', type: 'tomorrow' }
  if (diffDays > 1) return { text: `${diffDays} days away`, type: 'upcoming' }
  return null
}

export default function Home() {
  const sorted = [...announcements].sort((a, b) => new Date(b.date) - new Date(a.date))
  const nextMeet = schedule
    .filter(m => {
      if (m.status === 'cancelled') return false
      const meetDate = new Date(m.date + 'T00:00:00')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return meetDate >= today
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]

  const countdown = nextMeet ? getCountdownText(nextMeet.date) : null

  const [, setTick] = useState(0)
  useEffect(() => {
    const now = new Date()
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now
    const timer = setTimeout(() => setTick(t => t + 1), msUntilMidnight + 100)
    return () => clearTimeout(timer)
  })

  return (
    <div className="home">
      <section className="hero">
        <img src="/2021 Cougar Black Transparent.png" alt="" className="hero-watermark" />
        <div className="hero-content">
          <h1>Stillwater Christian</h1>
          <h2>Cougars Track &amp; Field</h2>
          <p className="hero-tagline">Speed &middot; Strength &middot; Character</p>
          {nextMeet ? (
            <div className="hero-next-meet">
              <span className="next-label">Next Meet</span>
              <span className="next-name">{nextMeet.name}</span>
              <span className="next-detail">
                {new Date(nextMeet.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric'
                })} &middot; {nextMeet.location}
              </span>
              {countdown && (
                <span className={`next-countdown ${countdown.type}`}>{countdown.text}</span>
              )}
            </div>
          ) : (
            <div className="hero-next-meet">
              <span className="next-label">2026 Season</span>
              <span className="next-countdown season-complete">Season Complete</span>
            </div>
          )}
        </div>
      </section>

      <section className="quick-links">
        <Link to="/roster" className="quick-card">
          <span className="quick-icon">👥</span>
          <span className="quick-label">Roster</span>
        </Link>
        <Link to="/schedule" className="quick-card">
          <span className="quick-icon">📅</span>
          <span className="quick-label">Schedule</span>
        </Link>
        <Link to="/results" className="quick-card">
          <span className="quick-icon">⚡</span>
          <span className="quick-label">Results</span>
        </Link>
        <Link to="/gallery" className="quick-card">
          <span className="quick-icon">📸</span>
          <span className="quick-label">Gallery</span>
        </Link>
        <Link to="/practice" className="quick-card">
          <span className="quick-icon">🏃</span>
          <span className="quick-label">Practice</span>
        </Link>
        <Link to="/records" className="quick-card">
          <span className="quick-icon">🏆</span>
          <span className="quick-label">Records</span>
        </Link>
      </section>

      <section className="announcements-section">
        <div className="section-title-row">
          <h2 className="section-title">News &amp; Announcements</h2>
          {isCoach() && (
            <Link to="/admin" className="coach-edit-btn">
              <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              Edit
            </Link>
          )}
        </div>
        <div className="announcement-list">
          {sorted.map(a => (
            <article key={a.id} className="announcement-card">
              <div className="announcement-meta">
                <span className="announcement-date">
                  {new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
              <h3>{a.title}</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="athletics-links-section">
        <h3 className="athletics-links-title">Stillwater Athletics</h3>
        <div className="athletics-links">
          <a href="https://www.stillwaterchristianschool.org/" target="_blank" rel="noopener noreferrer" className="athletics-link-card">
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>SCS Website</span>
          </a>
          <a href="https://www.stillwaterchristianschool.org/athletics/" target="_blank" rel="noopener noreferrer" className="athletics-link-card">
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.967.744L14.146 7.2 17.5 7.512a1 1 0 01.576 1.768l-2.572 2.19.832 3.242a1 1 0 01-1.506 1.094L12 13.884l-2.83 1.922a1 1 0 01-1.506-1.094l.832-3.242-2.572-2.19a1 1 0 01.576-1.768l3.354-.312 1.179-3.456A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            <span>Athletics Page</span>
          </a>
          <a href="https://www.athletic.net/school/StillwaterChristian" target="_blank" rel="noopener noreferrer" className="athletics-link-card">
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <span>Athletic.net</span>
          </a>
          <a href="https://www.facebook.com/scscougars/" target="_blank" rel="noopener noreferrer" className="athletics-link-card">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </a>
        </div>
      </section>
    </div>
  )
}

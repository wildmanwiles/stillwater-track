import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
        <h2 className="section-title">News &amp; Announcements</h2>
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
              <p>{a.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

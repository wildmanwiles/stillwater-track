import { Link } from 'react-router-dom'
import announcements from '../data/announcements.json'
import schedule from '../data/schedule.json'
import './Home.css'

export default function Home() {
  const sorted = [...announcements].sort((a, b) => new Date(b.date) - new Date(a.date))
  const nextMeet = schedule
    .filter(m => m.status === 'upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0]

  return (
    <div className="home">
      <section className="hero">
        <img src="/2021 Cougar Black Transparent.png" alt="" className="hero-watermark" />
        <div className="hero-content">
          <h1>Stillwater Christian</h1>
          <h2>Cougars Track &amp; Field</h2>
          <p className="hero-tagline">Speed &middot; Strength &middot; Character</p>
          {nextMeet && (
            <div className="hero-next-meet">
              <span className="next-label">Next Meet</span>
              <span className="next-name">{nextMeet.name}</span>
              <span className="next-detail">
                {new Date(nextMeet.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric'
                })} &middot; {nextMeet.location}
              </span>
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

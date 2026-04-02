import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import athletes from '../data/athletes.json'
import meetResults from '../data/meetResults.json'
import './AthleteProfile.css'

const TIME_EVENTS = new Set(['100m', '200m', '400m', '800m', '1500m', '1600m', '3200m', '110m Hurdles', '100m Hurdles', '300m Hurdles', '60m Hurdles'])

function parseTime(mark) {
  if (mark.includes(':')) {
    const [min, sec] = mark.split(':')
    return parseFloat(min) * 60 + parseFloat(sec)
  }
  return parseFloat(mark)
}

function parseMeasurement(mark) {
  const match = mark.match(/^(\d+)'([\d.]+)/)
  if (match) return parseFloat(match[1]) * 12 + parseFloat(match[2])
  return 0
}

function buildProgression(seasonHistory) {
  if (!seasonHistory || seasonHistory.length < 2) return []

  // For each event in each season, find the best mark
  const eventSeasons = {}
  seasonHistory.forEach(season => {
    season.results.forEach(r => {
      if (!eventSeasons[r.event]) eventSeasons[r.event] = []
      const existing = eventSeasons[r.event].find(s => s.season === season.season)
      if (!existing) {
        eventSeasons[r.event].push({ season: season.season, mark: r.mark })
      } else {
        // Keep the better mark
        const isTime = TIME_EVENTS.has(r.event)
        if (isTime) {
          if (parseTime(r.mark) < parseTime(existing.mark)) existing.mark = r.mark
        } else {
          if (parseMeasurement(r.mark) > parseMeasurement(existing.mark)) existing.mark = r.mark
        }
      }
    })
  })

  // Filter to events with 2+ seasons
  return Object.entries(eventSeasons)
    .filter(([, seasons]) => seasons.length >= 2)
    .map(([event, seasons]) => {
      const isTime = TIME_EVENTS.has(event)
      // Find the all-time best
      let bestMark = seasons[0].mark
      seasons.forEach(s => {
        if (isTime) {
          if (parseTime(s.mark) < parseTime(bestMark)) bestMark = s.mark
        } else {
          if (parseMeasurement(s.mark) > parseMeasurement(bestMark)) bestMark = s.mark
        }
      })
      return { event, seasons, bestMark, isTime }
    })
}

function SeasonProgression({ seasonHistory }) {
  const progressions = buildProgression(seasonHistory)
  if (progressions.length === 0) return null

  return (
    <section className="profile-section">
      <h2 className="profile-section-title">Season Progression</h2>
      <div className="progression-list">
        {progressions.map(({ event, seasons, bestMark, isTime }) => (
          <div key={event} className="progression-row">
            <span className="progression-event">{event}</span>
            <div className="progression-marks">
              {seasons.map((s, i) => {
                const isBest = s.mark === bestMark
                return (
                  <span key={s.season} className="progression-entry">
                    {i > 0 && <span className="progression-arrow">&rarr;</span>}
                    <span className="progression-season">{s.season}:</span>
                    <span className={`progression-mark ${isBest ? 'is-pb' : ''}`}>
                      {s.mark}
                      {isBest && <span className="progression-pb">PB</span>}
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SeasonSection({ season, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="season-block">
      <button className={`season-header ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <span className="season-label">{season.season}</span>
        <span className="season-grade">Grade {season.grade}</span>
        <span className="season-toggle">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="season-results">
          {season.results.map((r, i) => (
            <div key={i} className="season-result-row">
              <span className="season-result-event">{r.event}</span>
              <span className="season-result-mark">
                {r.mark}
              </span>
              <span className="season-result-meet">{r.meet}</span>
              <span className="season-result-date">
                {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AthleteProfile() {
  const { slug } = useParams()
  const athlete = athletes.find(a => `${a.first}-${a.last}`.toLowerCase() === slug)

  if (!athlete) {
    return (
      <div className="page athlete-profile">
        <div className="page-header">
          <h1 className="page-title">Athlete Not Found</h1>
        </div>
        <Link to="/roster" className="back-link">&larr; Back to Roster</Link>
      </div>
    )
  }

  const fullName = `${athlete.first} ${athlete.last}`

  // Gather all meet results for this athlete
  const athleteResults = []
  meetResults.forEach(meet => {
    const indiv = meet.results.filter(r => r.athlete === fullName)
    const relays = meet.relays.filter(r => r.athletes.includes(fullName))
    if (indiv.length > 0 || relays.length > 0) {
      athleteResults.push({ meet, individual: indiv, relays })
    }
  })

  const prs = athlete.prs || {}
  const prEntries = Object.entries(prs)
  const seasonHistory = athlete.seasonHistory || []

  return (
    <div className="page athlete-profile">
      <Link to="/roster" className="back-link">&larr; Back to Roster</Link>

      <div className="profile-header">
        <h1 className="profile-name">{athlete.first} {athlete.last}</h1>
        <div className="profile-meta">
          <span className="profile-grade">{athlete.grade}th Grade</span>
          <span className={`profile-gender ${athlete.gender === 'M' ? 'boys' : 'girls'}`}>
            {athlete.gender === 'M' ? 'Boys' : 'Girls'}
          </span>
          {athlete.role === 'manager' && (
            <span className="profile-role">Manager</span>
          )}
        </div>
        {athlete.role !== 'manager' && athlete.primaryEvent && (
          <p className="profile-primary">Primary: {athlete.primaryEvent}</p>
        )}
      </div>

      {athlete.role !== 'manager' && athlete.events.length > 0 && (
        <section className="profile-section">
          <h2 className="profile-section-title">Events</h2>
          <div className="profile-events">
            {athlete.events.map(e => (
              <span key={e} className="profile-event-tag">{e}</span>
            ))}
          </div>
        </section>
      )}

      {prEntries.length > 0 && (
        <section className="profile-section">
          <h2 className="profile-section-title">All-Time Personal Records</h2>
          <div className="pr-list">
            {prEntries.map(([event, mark]) => (
              <div key={event} className="pr-row">
                <span className="pr-event">{event}</span>
                <span className="pr-mark">{mark}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <SeasonProgression seasonHistory={seasonHistory} />

      {seasonHistory.length > 0 && (
        <section className="profile-section">
          <h2 className="profile-section-title">Season History</h2>
          {[...seasonHistory].reverse().map((season, i) => (
            <SeasonSection key={season.season} season={season} defaultOpen={i === 0} />
          ))}
        </section>
      )}

      {athleteResults.length > 0 && (
        <section className="profile-section">
          <h2 className="profile-section-title">2026 Meet Results</h2>
          {athleteResults.map(({ meet, individual, relays }) => (
            <div key={meet.meetId} className="profile-meet">
              <div className="profile-meet-header">
                <Link to={`/results/${meet.meetId}`} className="profile-meet-name">
                  {meet.meetName}
                </Link>
                <span className="profile-meet-date">
                  {new Date(meet.date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
              <div className="profile-results-list">
                {individual.map((r, i) => (
                  <div key={i} className="profile-result-row">
                    <span className="profile-result-event">{r.event}</span>
                    <span className="profile-result-mark">
                      {r.mark}
                    </span>
                    <span className="profile-result-place">
                      {r.place <= 3 ? ['🥇','🥈','🥉'][r.place - 1] : `${r.place}th`}
                    </span>
                  </div>
                ))}
                {relays.map((r, i) => (
                  <div key={`relay-${i}`} className="profile-relay-block">
                    <div className="profile-result-row">
                      <span className="profile-result-event">{r.event}</span>
                      <span className="profile-result-mark">{r.mark}</span>
                      <span className="profile-result-place">
                        {r.place <= 3 ? ['🥇','🥈','🥉'][r.place - 1] : `${r.place}th`}
                      </span>
                    </div>
                    <div className="profile-relay-athletes">
                      {r.athletes.map((name, j) => (
                        <span key={j}>
                          {name === fullName
                            ? <strong className="relay-self">{name}</strong>
                            : <span className="relay-teammate">{name}</span>
                          }
                          {j < r.athletes.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {athlete.role !== 'manager' && athleteResults.length === 0 && prEntries.length === 0 && seasonHistory.length === 0 && (
        <div className="profile-empty">No results recorded yet.</div>
      )}
    </div>
  )
}

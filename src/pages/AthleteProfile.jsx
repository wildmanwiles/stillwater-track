import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { isCoach } from '../utils/auth'
import athletes from '../data/athletes.json'
import meetResults from '../data/meetResults.json'
import practiceData from '../data/practiceData.json'
import { isSchoolRecord } from '../utils/recordCheck'
import AthletePhoto from '../components/AthletePhoto'
import '../components/SchoolRecordBanner.css'
import '../pages/Admin.css'
import './AthleteProfile.css'

const TIME_EVENTS = new Set(['100m', '200m', '400m', '800m', '1500m', '1600m', '3200m', '110m Hurdles', '100m Hurdles', '300m Hurdles', '60m Hurdles'])

const WORKOUT_DISTANCES = {
  '10x40M': 40, '5x100M': 100, '10M Fly': 10, '25M to 10M Fly': 10,
  '20M Competitive Fly': 20, '200x3 / 600M Predictor': 200, '5x40M Fly': 40,
}

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

function getAthleteMph(a, workoutType) {
  if (a.mph != null) return a.mph
  if (a.avgMph != null) return a.avgMph
  const best = a.best || a.best100 || a.best200 || null
  if (best == null) return null
  const dist = WORKOUT_DISTANCES[workoutType]
  if (!dist) return null
  return (dist / best) * 2.23694
}

function computeSpeedRanks() {
  const map = {}
  for (const workout of practiceData.workouts) {
    for (const session of workout.sessions) {
      for (const a of session.athletes) {
        const mph = getAthleteMph(a, workout.type)
        if (mph == null) continue
        if (!map[a.name] || mph > map[a.name].mph) {
          map[a.name] = { name: a.name, gender: a.gender, mph }
        }
      }
    }
  }
  const all = Object.values(map)
  const males = all.filter(a => a.gender === 'M').sort((a, b) => b.mph - a.mph)
  const females = all.filter(a => a.gender === 'F').sort((a, b) => b.mph - a.mph)
  const ranks = {}
  males.forEach((a, i) => { ranks[a.name] = { rank: i + 1, total: males.length, mph: a.mph, label: 'Males' } })
  females.forEach((a, i) => { ranks[a.name] = { rank: i + 1, total: females.length, mph: a.mph, label: 'Females' } })
  return ranks
}

const speedRanks = computeSpeedRanks()

function buildProgression(seasonHistory) {
  if (!seasonHistory || seasonHistory.length < 2) return []

  const eventSeasons = {}
  seasonHistory.forEach(season => {
    season.results.forEach(r => {
      if (!eventSeasons[r.event]) eventSeasons[r.event] = []
      const existing = eventSeasons[r.event].find(s => s.season === season.season)
      if (!existing) {
        eventSeasons[r.event].push({ season: season.season, mark: r.mark })
      } else {
        const isTime = TIME_EVENTS.has(r.event)
        if (isTime) {
          if (parseTime(r.mark) < parseTime(existing.mark)) existing.mark = r.mark
        } else {
          if (parseMeasurement(r.mark) > parseMeasurement(existing.mark)) existing.mark = r.mark
        }
      }
    })
  })

  return Object.entries(eventSeasons)
    .filter(([, seasons]) => seasons.length >= 2)
    .map(([event, seasons]) => {
      const isTime = TIME_EVENTS.has(event)
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

function ShareButton({ athleteName }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const shareData = {
      title: `${athleteName} — SCS Track & Field`,
      text: `Check out ${athleteName} on SCS Cougars Track & Field!`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (e) {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button className="share-btn" onClick={handleShare} aria-label="Share profile">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
      {copied ? 'Link copied!' : 'Share'}
    </button>
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
  const speed = speedRanks[fullName]

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
        <AthletePhoto slug={slug} size="large" />
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
        <ShareButton athleteName={fullName} />
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

      {speed && (
        <section className="profile-section">
          <div className="speed-rank-card">
            <div className="speed-rank-header">
              <span className="speed-rank-icon">&#9889;</span>
              <span className="speed-rank-label">Speed Rank</span>
            </div>
            <div className="speed-rank-body">
              <span className="speed-rank-number">#{speed.rank}</span>
              <span className="speed-rank-gender">{speed.label}</span>
              <span className="speed-rank-mph">{speed.mph.toFixed(1)} MPH</span>
            </div>
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
                <span className="pr-mark">
                  {mark}
                  {isSchoolRecord(event, mark, athlete.gender, athlete.grade) && <span className="sr-holder-label">School Record Holder</span>}
                </span>
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
                {individual.map((r, i) => {
                  const sr = isSchoolRecord(r.event, r.mark, r.gender, r.grade)
                  return (
                    <div key={i}>
                      {sr && (
                        <div className="sr-banner">
                          <p className="sr-banner-title">&#9733; NEW SCHOOL RECORD &#9733;</p>
                          <p className="sr-banner-detail">{r.event} &mdash; {r.mark}</p>
                        </div>
                      )}
                      <div className="profile-result-row">
                        <span className="profile-result-event">{r.event}</span>
                        <span className="profile-result-mark">{r.mark}</span>
                        <span className="profile-result-place">
                          {r.place <= 3 ? ['🥇','🥈','🥉'][r.place - 1] : `${r.place}th`}
                        </span>
                      </div>
                    </div>
                  )
                })}
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

      {isCoach() && (
        <section className="profile-section coach-notes-section">
          <div className="coach-notes-header">
            <h2 className="profile-section-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>Coach Notes</h2>
            <span className="coach-notes-badge">Coach Only</span>
          </div>
          <textarea
            className="coach-notes-textarea"
            placeholder="Add notes about this athlete (injury status, training notes, etc.)"
            rows={4}
          />
          <div className="disabled-btn-wrap" style={{ marginTop: '0.75rem' }}>
            <button className="admin-save-btn disabled" disabled>Save Notes</button>
            <span className="disabled-tooltip">Database connection required. Coming in next update.</span>
          </div>
        </section>
      )}

      {athlete.role !== 'manager' && athleteResults.length === 0 && prEntries.length === 0 && seasonHistory.length === 0 && !speed && (
        <div className="profile-empty">No results recorded yet.</div>
      )}
    </div>
  )
}

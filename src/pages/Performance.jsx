import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import speedBoard from '../data/speedBoard.json'
import meetResults from '../data/meetResults.json'
import athletes from '../data/athletes.json'
import { isSchoolRecord } from '../utils/recordCheck'
import '../components/SchoolRecordBanner.css'
import './Performance.css'

const MEDALS = ['🥇', '🥈', '🥉']

const TABS = [
  { id: 'sprints', label: 'Sprints', icon: '🏃', events: ['100m', '200m', '400m'] },
  { id: 'throws', label: 'Throws', icon: '💪', events: ['Shot Put', 'Discus', 'Javelin'] },
  { id: 'jumps', label: 'Jumps', icon: '🦘', events: ['High Jump', 'Long Jump', 'Triple Jump'] },
  { id: 'hurdles', label: 'Hurdles', icon: '🚧', events: ['110m Hurdles', '100m Hurdles', '300m Hurdles'] },
  { id: 'distance', label: 'Distance', icon: '🏅', events: ['800m', '1500m', '3200m'] },
  { id: 'relays', label: 'Relays', icon: '🏃‍♂️', events: [] },
  { id: 'speed-board', label: 'Speed Board', icon: '⚡', events: [] },
]

const TIME_EVENTS = new Set(['100m', '200m', '400m', '800m', '1500m', '3200m', '110m Hurdles', '100m Hurdles', '300m Hurdles'])
const FIELD_EVENTS = new Set(['High Jump', 'Long Jump', 'Triple Jump', 'Shot Put', 'Discus', 'Javelin'])

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

function findAthleteSlug(name) {
  const [first, ...lastParts] = name.split(' ')
  const last = lastParts.join(' ')
  const athlete = athletes.find(a => a.first === first && a.last === last)
  return athlete ? `${athlete.first}-${athlete.last}`.toLowerCase() : null
}

function buildSeasonBests() {
  const bests = {}

  meetResults.forEach(meet => {
    meet.results.forEach(r => {
      const key = `${r.gender}|${r.event}|${r.athlete}`
      if (!bests[key]) {
        bests[key] = { ...r, meetName: meet.meetName, meetId: meet.meetId }
      } else {
        const isTime = TIME_EVENTS.has(r.event)
        const isField = FIELD_EVENTS.has(r.event)
        if (isTime) {
          if (parseTime(r.mark) < parseTime(bests[key].mark)) {
            bests[key] = { ...r, meetName: meet.meetName, meetId: meet.meetId }
          }
        } else if (isField) {
          if (parseMeasurement(r.mark) > parseMeasurement(bests[key].mark)) {
            bests[key] = { ...r, meetName: meet.meetName, meetId: meet.meetId }
          }
        }
      }
    })
  })

  return Object.values(bests)
}

function buildRelayResults() {
  const relays = []
  meetResults.forEach(meet => {
    meet.relays.forEach(r => {
      relays.push({ ...r, meetName: meet.meetName, meetId: meet.meetId })
    })
  })
  return relays
}

function AthleteLink({ name }) {
  const slug = findAthleteSlug(name)
  if (slug) return <Link to={`/athlete/${slug}`} className="perf-athlete-link">{name}</Link>
  return <span>{name}</span>
}

function EventRankings({ event, results, gender, label }) {
  const filtered = results.filter(r => r.event === event && r.gender === gender)

  const isTime = TIME_EVENTS.has(event)
  const sorted = [...filtered].sort((a, b) => {
    if (isTime) return parseTime(a.mark) - parseTime(b.mark)
    return parseMeasurement(b.mark) - parseMeasurement(a.mark)
  })

  if (sorted.length === 0) return null

  return (
    <div className="perf-event-section">
      {sorted.map((r, i) => {
        const sr = isSchoolRecord(r.event, r.mark, r.gender, r.grade)
        return (
          <div key={`${r.athlete}-${i}`}>
            {sr && (
              <div className="sr-banner">
                <p className="sr-banner-title">&#9733; NEW SCHOOL RECORD &#9733;</p>
                <p className="sr-banner-detail">{r.athlete} &mdash; {r.event} &mdash; {r.mark}</p>
              </div>
            )}
            <div className="perf-result-row">
              <span className="perf-rank">
                {i < 3 ? MEDALS[i] : <span className="perf-rank-num">{i + 1}</span>}
              </span>
              <div className="perf-result-info">
                <AthleteLink name={r.athlete} />
                <span className="perf-result-grade">{r.grade}th</span>
              </div>
              <span className="perf-result-mark">{r.mark}</span>
              <Link to={`/results/${r.meetId}`} className="perf-result-meet">{r.meetName}</Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GenderEventBlock({ event, results, gender, label }) {
  const filtered = results.filter(r => r.event === event && r.gender === gender)
  if (filtered.length === 0) return null

  return (
    <div className="perf-gender-block">
      <h4 className="perf-gender-label">{label}</h4>
      <EventRankings event={event} results={results} gender={gender} label={label} />
    </div>
  )
}

function EventSection({ event, results }) {
  const hasBoys = results.some(r => r.event === event && r.gender === 'M')
  const hasGirls = results.some(r => r.event === event && r.gender === 'F')

  if (!hasBoys && !hasGirls) {
    return (
      <div className="perf-event-card">
        <h3 className="perf-event-title">{event}</h3>
        <p className="perf-no-results">No results recorded yet this season</p>
      </div>
    )
  }

  return (
    <div className="perf-event-card">
      <h3 className="perf-event-title">{event}</h3>
      <GenderEventBlock event={event} results={results} gender="M" label="Boys" />
      <GenderEventBlock event={event} results={results} gender="F" label="Girls" />
    </div>
  )
}

function getRelayGrade(athleteNames) {
  for (const name of athleteNames) {
    const [first, ...lastParts] = name.split(' ')
    const last = lastParts.join(' ')
    const a = athletes.find(x => x.first === first && x.last === last)
    if (a) return a.grade
  }
  return 10
}

function RelayEventCard({ event, relays }) {
  const boysResults = relays.filter(r => r.event === event && r.gender === 'M')
  const girlsResults = relays.filter(r => r.event === event && r.gender === 'F')

  const renderGenderBlock = (items, label) => {
    if (items.length === 0) return null
    const sorted = [...items].sort((a, b) => parseTime(a.mark) - parseTime(b.mark))

    return (
      <div className="perf-gender-block">
        <h4 className="perf-gender-label">{label}</h4>
        <div className="perf-event-section">
          {sorted.map((r, i) => {
            const sr = isSchoolRecord(r.event, r.mark, r.gender, getRelayGrade(r.athletes))
            return (
              <div key={i}>
                {sr && (
                  <div className="sr-banner">
                    <p className="sr-banner-title">&#9733; NEW SCHOOL RECORD &#9733;</p>
                    <p className="sr-banner-detail">{r.event} &mdash; {r.mark}</p>
                  </div>
                )}
                <div className="perf-result-row">
                  <span className="perf-rank">
                    {i < 3 ? MEDALS[i] : <span className="perf-rank-num">{i + 1}</span>}
                  </span>
                  <div className="perf-result-info perf-relay-info">
                    <span className="perf-result-mark">{r.mark}</span>
                    <div className="perf-relay-athletes">
                      {r.athletes.map((name, j) => (
                        <span key={j}><AthleteLink name={name} />{j < r.athletes.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  </div>
                  <Link to={`/results/${r.meetId}`} className="perf-result-meet">{r.meetName}</Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="perf-event-card">
      <h3 className="perf-event-title">{event}</h3>
      {renderGenderBlock(boysResults, 'Boys')}
      {renderGenderBlock(girlsResults, 'Girls')}
    </div>
  )
}

function RelaySection({ relays }) {
  if (relays.length === 0) {
    return <p className="perf-no-results">No relay results recorded yet this season</p>
  }

  const eventOrder = []
  relays.forEach(r => {
    if (!eventOrder.includes(r.event)) eventOrder.push(r.event)
  })

  return (
    <>
      {eventOrder.map(event => (
        <RelayEventCard key={event} event={event} relays={relays} />
      ))}
    </>
  )
}

function LeaderTable({ title, entries }) {
  const sorted = [...entries].sort((a, b) => b.mph - a.mph)

  return (
    <div className="leader-section">
      <h2 className="leader-title">{title}</h2>
      <div className="leader-table-wrap">
        <table className="leader-table">
          <thead>
            <tr>
              <th className="col-rank">#</th>
              <th>Athlete</th>
              <th>Grade</th>
              <th className="col-num">MPH</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, i) => (
              <tr key={entry.name} className={i < 3 ? `top-${i + 1}` : ''}>
                <td className="col-rank">
                  {i < 3 ? (
                    <span className="medal">{MEDALS[i]}</span>
                  ) : (
                    <span className="rank-num">{i + 1}</span>
                  )}
                </td>
                <td className="athlete-cell">{entry.name}</td>
                <td>{entry.grade}</td>
                <td className="col-num mph-cell">{entry.mph.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Performance() {
  const [activeTab, setActiveTab] = useState('sprints')
  const current = TABS.find(t => t.id === activeTab)

  const seasonBests = useMemo(() => buildSeasonBests(), [])
  const relayResults = useMemo(() => buildRelayResults(), [])

  return (
    <div className="page performance">
      <div className="page-header">
        <h1 className="page-title">⚡ Performance</h1>
        <p className="page-subtitle">Track &amp; Field Results</p>
      </div>

      <div className="perf-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`perf-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="perf-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="perf-content">
        {activeTab === 'speed-board' ? (
          <div className="leader-grid">
            <LeaderTable title="Boys" entries={speedBoard.males} />
            <LeaderTable title="Girls" entries={speedBoard.females} />
          </div>
        ) : activeTab === 'relays' ? (
          <>
            <p className="perf-season-note">2026 Season Best Performances — updated after each meet</p>
            <RelaySection relays={relayResults} />
          </>
        ) : (
          <>
            <p className="perf-season-note">2026 Season Best Performances — updated after each meet</p>
            {current.events.map(event => (
              <EventSection key={event} event={event} results={seasonBests} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

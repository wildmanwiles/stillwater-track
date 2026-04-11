import { useParams, Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import meetResults from '../data/meetResults.json'
import athletes from '../data/athletes.json'
import schedule from '../data/schedule.json'
import records from '../data/records.json'
import { isCoach } from '../utils/auth'
import { isSchoolRecord } from '../utils/recordCheck'
import * as XLSX from 'xlsx'
import '../components/SchoolRecordBanner.css'
import './MeetResults.css'

function findAthleteSlug(name) {
  const [first, ...lastParts] = name.split(' ')
  const last = lastParts.join(' ')
  const athlete = athletes.find(a => a.first === first && a.last === last)
  return athlete ? `${athlete.first}-${athlete.last}`.toLowerCase() : null
}

function AthleteLink({ name }) {
  const slug = findAthleteSlug(name)
  if (slug) {
    return <Link to={`/athlete/${slug}`} className="result-athlete-link">{name}</Link>
  }
  return <span>{name}</span>
}

function PlaceBadge({ place }) {
  if (place <= 3) {
    const medals = ['🥇', '🥈', '🥉']
    return <span className="place-medal">{medals[place - 1]}</span>
  }
  return <span className="place-num">{place}</span>
}

function ResultRow({ r }) {
  const sr = isSchoolRecord(r.event, r.mark, r.gender, r.grade)
  return (
    <>
      {sr && (
        <div className="sr-banner">
          <p className="sr-banner-title">&#9733; NEW SCHOOL RECORD &#9733;</p>
          <p className="sr-banner-detail">{r.athlete} &mdash; {r.event} &mdash; {r.mark}</p>
        </div>
      )}
      <div className="result-row">
        <div className="result-place"><PlaceBadge place={r.place} /></div>
        <div className="result-info">
          <AthleteLink name={r.athlete} />
          <span className="result-grade">{r.grade}th</span>
        </div>
        <div className="result-mark">
          {r.mark}
          {r.pr && <span className="sb-badge" title="Season Best 2026">SB</span>}
        </div>
      </div>
    </>
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

function RelayRow({ r }) {
  const grade = getRelayGrade(r.athletes)
  const sr = isSchoolRecord(r.event, r.mark, r.gender, grade)
  return (
    <>
      {sr && (
        <div className="sr-banner">
          <p className="sr-banner-title">&#9733; NEW SCHOOL RECORD &#9733;</p>
          <p className="sr-banner-detail">{r.event} &mdash; {r.mark}</p>
        </div>
      )}
      <div className="result-row relay-row">
        <div className="result-place"><PlaceBadge place={r.place} /></div>
        <div className="result-info">
          <span className="relay-event-name">{r.event}</span>
          <div className="relay-athletes">
            {r.athletes.map((name, i) => (
              <span key={i}><AthleteLink name={name} />{i < r.athletes.length - 1 ? ', ' : ''}</span>
            ))}
          </div>
        </div>
        <div className="result-mark">{r.mark}</div>
      </div>
    </>
  )
}

function EventGroup({ event, results }) {
  return (
    <div className="event-group">
      <h4 className="event-group-title">{event}</h4>
      {results.map((r, i) => <ResultRow key={i} r={r} />)}
    </div>
  )
}

function GenderSection({ gender, label, results, relays }) {
  const genderResults = results.filter(r => r.gender === gender)
  const genderRelays = relays.filter(r => r.gender === gender)

  const eventOrder = []
  const eventMap = {}
  genderResults.forEach(r => {
    if (!eventMap[r.event]) {
      eventMap[r.event] = []
      eventOrder.push(r.event)
    }
    eventMap[r.event].push(r)
  })

  if (genderResults.length === 0 && genderRelays.length === 0) return null

  return (
    <div className="gender-section">
      <h3 className="gender-title">{label}</h3>

      {eventOrder.map(event => (
        <EventGroup key={event} event={event} results={eventMap[event]} />
      ))}

      {genderRelays.length > 0 && (
        <div className="event-group">
          <h4 className="event-group-title">Relays</h4>
          {genderRelays.map((r, i) => <RelayRow key={i} r={r} />)}
        </div>
      )}
    </div>
  )
}

const TIME_EVENTS_SR = new Set([
  '100m', '200m', '400m', '800m', '1500m', '1600m', '3200m', '1 Mile',
  '110m Hurdles', '100m Hurdles', '300m Hurdles', '60m Hurdles',
])

function parseTimeSR(mark) {
  if (mark.includes(':')) {
    const [min, sec] = mark.split(':')
    return parseFloat(min) * 60 + parseFloat(sec)
  }
  return parseFloat(mark)
}

function parseMeasurementSR(mark) {
  const match = mark.match(/^(\d+)'([\d.]+)/)
  if (match) return parseFloat(match[1]) * 12 + parseFloat(match[2])
  return 0
}

function shortName(fullName) {
  const parts = fullName.split(' ')
  if (parts.length < 2) return fullName
  return parts[0][0] + '. ' + parts.slice(1).join(' ')
}

function lastName(fullName) {
  const parts = fullName.split(' ')
  return parts.slice(1).join(' ') || fullName
}

function ordinalPlace(place) {
  if (place == null) return ''
  if (place === 1) return '1st Place'
  if (place === 2) return '2nd Place'
  if (place === 3) return '3rd Place'
  return `${place}th`
}

function isSB(athlete, event, mark, currentMeetId) {
  if (mark === 'NH' || mark === 'DQ' || mark === 'DNS' || mark === 'DNF') return false
  for (const m of meetResults) {
    if (m.meetId === currentMeetId) continue
    for (const r of m.results) {
      if (r.athlete !== athlete || r.event !== event) continue
      if (r.mark === 'NH' || r.mark === 'DQ') continue
      return false // has a previous result in this event, so not automatically SB
    }
  }
  return true // first result = automatic SB
}

function detectBrokenRecords(meet) {
  const broken = []
  for (const r of meet.results) {
    if (r.mark === 'NH' || r.mark === 'DQ' || r.mark === 'DNS' || r.mark === 'DNF') continue
    const division = r.grade <= 8 ? 'jrHigh' : 'highSchool'
    const genderKey = r.gender === 'M' ? 'boys' : 'girls'
    const divLabel = r.grade <= 8 ? 'MS' : 'HS'
    const recs = records[division][genderKey]
    for (const rec of recs) {
      if (rec.event !== r.event || rec.mark === '—' || !rec.mark) continue
      const isTime = TIME_EVENTS_SR.has(rec.event)
      const recVal = isTime ? parseTimeSR(rec.mark) : parseMeasurementSR(rec.mark)
      const meetVal = isTime ? parseTimeSR(r.mark) : parseMeasurementSR(r.mark)
      if ((isTime && meetVal <= recVal) || (!isTime && meetVal >= recVal)) {
        broken.push({ event: rec.event, athlete: r.athlete, division: divLabel })
      }
    }
  }
  // Deduplicate
  const seen = new Set()
  return broken.filter(b => {
    const key = `${b.division}|${b.event}|${b.athlete}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getNextUpcomingMeet() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return schedule
    .filter(m => m.status !== 'cancelled' && m.status !== 'completed')
    .filter(m => new Date(m.date + 'T00:00:00') >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null
}

function generateSportReport(meet) {
  const brokenRecords = detectBrokenRecords(meet)
  const nextMeet = getNextUpcomingMeet()

  function buildGenderSection(gender, label) {
    const results = meet.results.filter(r => r.gender === gender)
    const relays = meet.relays.filter(r => r.gender === gender)
    if (results.length === 0 && relays.length === 0) return ''

    const lines = []
    lines.push(`${label} TRACK & FIELD`)

    const meetDate = new Date(meet.date + 'T00:00:00')
    const dateStr = `${meetDate.getMonth() + 1}/${meetDate.getDate()}`
    const locationCity = meet.location.split(',')[0]
    lines.push(`${dateStr} ${locationCity} Dual Meet (MS & HS)`)

    const genderRecords = brokenRecords.filter(b => {
      const r = meet.results.find(x => x.athlete === b.athlete && x.event === b.event && x.gender === gender)
      return !!r
    })
    if (genderRecords.length > 0) {
      const descriptions = genderRecords.map(b => `${b.division} ${b.event} by ${shortName(b.athlete)}`)
      lines.push(`School Records: ${descriptions.join('; ')}`)
    }

    lines.push('Individual Results - "SB" is Season Best')

    // Group by event
    const eventOrder = []
    const eventMap = {}
    results.forEach(r => {
      if (!eventMap[r.event]) { eventMap[r.event] = []; eventOrder.push(r.event) }
      eventMap[r.event].push(r)
    })

    for (const event of eventOrder) {
      const entries = eventMap[event]
      const parts = entries.map(r => {
        const name = shortName(r.athlete)
        const placeStr = ordinalPlace(r.place)
        const sb = r.pr ? ', SB' : ''
        if (r.mark === 'NH') return `${name} - NH`
        return `${name} - ${r.mark} (${placeStr}${sb})`
      })
      lines.push(`${event}: ${parts.join('; ')}`)
    }

    // Relays
    if (relays.length > 0) {
      const relaysByEvent = {}
      relays.forEach(r => {
        if (!relaysByEvent[r.event]) relaysByEvent[r.event] = []
        relaysByEvent[r.event].push(r)
      })
      for (const [event, entries] of Object.entries(relaysByEvent)) {
        const parts = entries.map(r => {
          const names = r.athletes.map(n => lastName(n)).join(', ')
          if (r.mark === 'DQ') return `${names} - DQ`
          const placeStr = ordinalPlace(r.place)
          return `${names} - ${r.mark} (${placeStr})`
        })
        const shortEvent = event.replace('m Relay', '').replace('4x', '4x')
        lines.push(`Relays - ${shortEvent}: ${parts.join('; ')}`)
      }
    }

    if (nextMeet) {
      const nd = new Date(nextMeet.date + 'T00:00:00')
      const ndStr = `${nd.getMonth() + 1}/${nd.getDate()}`
      const locCity = nextMeet.location.split(',')[0]
      lines.push('Upcoming')
      lines.push(`${ndStr} - ${nextMeet.name} @ ${locCity}`)
    }

    return lines.join('\n')
  }

  const women = buildGenderSection('F', "WOMEN'S")
  const men = buildGenderSection('M', "MEN'S")

  return [women, men].filter(Boolean).join('\n\n')
}

function exportExcel(meet) {
  const wb = XLSX.utils.book_new()

  for (const [gender, label] of [['F', 'Girls'], ['M', 'Boys']]) {
    const results = meet.results
      .filter(r => r.gender === gender)
      .sort((a, b) => {
        if (a.event < b.event) return -1
        if (a.event > b.event) return 1
        return (a.place || 999) - (b.place || 999)
      })

    const rows = results.map(r => ({
      Event: r.event,
      Athlete: r.athlete,
      Grade: r.grade,
      Mark: r.mark,
      Place: r.place != null ? r.place : '—',
      SB: r.pr ? 'Yes' : 'No',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 16 }, { wch: 24 }, { wch: 6 }, { wch: 14 }, { wch: 6 }, { wch: 4 }]
    XLSX.utils.book_append_sheet(wb, ws, `${label} Individual`)
  }

  for (const [gender, label] of [['F', 'Girls'], ['M', 'Boys']]) {
    const relays = meet.relays
      .filter(r => r.gender === gender)
      .sort((a, b) => {
        if (a.event < b.event) return -1
        if (a.event > b.event) return 1
        return (a.place || 999) - (b.place || 999)
      })

    const rows = relays.map(r => ({
      Event: r.event,
      'Team Time': r.mark,
      Place: r.place != null ? r.place : '—',
      'Athlete 1': r.athletes[0] || '',
      'Athlete 2': r.athletes[1] || '',
      'Athlete 3': r.athletes[2] || '',
      'Athlete 4': r.athletes[3] || '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 6 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 }]
    XLSX.utils.book_append_sheet(wb, ws, `${label} Relays`)
  }

  const fileName = meet.meetName.replace(/\s+/g, '_') + '_Results.xlsx'
  XLSX.writeFile(wb, fileName)
}

function ExportMenu({ meet }) {
  const [open, setOpen] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reportText, setReportText] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleSportReport() {
    setReportText(generateSportReport(meet))
    setShowReport(true)
    setOpen(false)
  }

  function handleExcel() {
    exportExcel(meet)
    setOpen(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(reportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="export-wrap" ref={dropdownRef}>
        <button className="export-btn" onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
          </svg>
          Export
        </button>
        {open && (
          <div className="export-dropdown">
            <button className="export-option" onClick={handleSportReport}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Sport Report (Copy for Email)
            </button>
            <button className="export-option" onClick={handleExcel}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Excel Download
            </button>
            <button className="export-option disabled" disabled>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              PDF Download
              <span className="export-coming-soon">Coming Soon</span>
            </button>
          </div>
        )}
      </div>
      {showReport && (
        <div className="export-modal-overlay" onClick={() => setShowReport(false)}>
          <div className="export-modal" onClick={e => e.stopPropagation()}>
            <div className="export-modal-header">
              <h3>Sport Report</h3>
              <div className="export-modal-actions">
                <button className="export-copy-btn" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button className="export-close-btn" onClick={() => setShowReport(false)}>Close</button>
              </div>
            </div>
            <textarea className="export-textarea" value={reportText} readOnly />
          </div>
        </div>
      )}
    </>
  )
}

export default function MeetResults() {
  const { meetId } = useParams()
  const meet = meetResults.find(m => m.meetId === Number(meetId))

  if (!meet) {
    return (
      <div className="page meet-results">
        <div className="page-header">
          <h1 className="page-title">Meet Not Found</h1>
        </div>
        <Link to="/schedule" className="back-link">&larr; Back to Schedule</Link>
      </div>
    )
  }

  return (
    <div className="page meet-results">
      <Link to="/schedule" className="back-link">&larr; Back to Schedule</Link>

      <div className="page-header meet-header-row">
        <div>
          <h1 className="page-title">{meet.meetName}</h1>
          <p className="page-subtitle">
            {new Date(meet.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            })} &middot; {meet.location}
          </p>
        </div>
        {isCoach() && <ExportMenu meet={meet} />}
      </div>

      {meet.note && (
        <div className="meet-note">{meet.note}</div>
      )}

      <div className="results-container">
        <GenderSection gender="M" label="Boys" results={meet.results} relays={meet.relays} />
        <GenderSection gender="F" label="Girls" results={meet.results} relays={meet.relays} />
      </div>
    </div>
  )
}

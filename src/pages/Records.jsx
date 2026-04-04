import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import records from '../data/records.json'
import meetResults from '../data/meetResults.json'
import athletes from '../data/athletes.json'
import './Records.css'

const TIME_EVENTS = new Set(['100m', '200m', '400m', '800m', '1500m', '1600m', '3200m', '110m Hurdles', '100m Hurdles', '300m Hurdles', '60m Hurdles', '1 Mile'])

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

function formatInchDiff(inches) {
  const ft = Math.floor(inches / 12)
  const inch = (inches % 12).toFixed(1).replace(/\.0$/, '')
  if (ft === 0) return `${inch}"`
  return `${ft}'${inch}"`
}

function findAthleteSlug(name) {
  const [first, ...lastParts] = name.split(' ')
  const last = lastParts.join(' ')
  const a = athletes.find(x => x.first === first && x.last === last)
  return a ? `${a.first}-${a.last}`.toLowerCase() : null
}

function buildRecordWatch() {
  // Build season bests per athlete per event per gender
  const bests = {}
  meetResults.forEach(meet => {
    meet.results.forEach(r => {
      const key = `${r.gender}|${r.event}|${r.athlete}`
      const isTime = TIME_EVENTS.has(r.event)
      if (!bests[key]) {
        bests[key] = { ...r }
      } else {
        if (isTime) {
          if (parseTime(r.mark) < parseTime(bests[key].mark)) bests[key] = { ...r }
        } else {
          if (parseMeasurement(r.mark) > parseMeasurement(bests[key].mark)) bests[key] = { ...r }
        }
      }
    })
  })

  const close = []

  // Check HS records (grade >= 9) and JH records (grade <= 8)
  const divisions = [
    { key: 'highSchool', minGrade: 9 },
    { key: 'jrHigh', minGrade: 0, maxGrade: 8 },
  ]

  for (const div of divisions) {
    for (const genderKey of ['boys', 'girls']) {
      const gender = genderKey === 'boys' ? 'M' : 'F'
      const recs = records[div.key][genderKey]

      for (const rec of recs) {
        if (rec.mark === '—' || !rec.mark) continue
        if (rec.event.includes('Relay') || rec.event.includes('Medley')) continue

        const isTime = TIME_EVENTS.has(rec.event)
        const recVal = isTime ? parseTime(rec.mark) : parseMeasurement(rec.mark)
        if (recVal === 0) continue

        // Find athletes with season bests in this event/gender
        Object.values(bests).forEach(sb => {
          if (sb.event !== rec.event || sb.gender !== gender) return
          // Check division match
          if (div.key === 'highSchool' && sb.grade < 9) return
          if (div.key === 'jrHigh' && sb.grade > 8) return

          const sbVal = isTime ? parseTime(sb.mark) : parseMeasurement(sb.mark)

          let pct, diff, diffText
          if (isTime) {
            pct = recVal / sbVal // lower is better, so record/athlete
            diff = sbVal - recVal
            diffText = `${diff.toFixed(2)}s away`
          } else {
            pct = sbVal / recVal // higher is better
            diff = recVal - sbVal
            diffText = `${formatInchDiff(diff)} away`
          }

          if (pct >= 0.85 && pct < 1.0) {
            close.push({
              athlete: sb.athlete,
              event: rec.event,
              gender,
              seasonBest: sb.mark,
              record: rec.mark,
              recordHolder: rec.athlete,
              recordYear: rec.year,
              pct,
              diffText,
              division: div.key === 'highSchool' ? 'HS' : 'JH',
            })
          }
        })
      }
    }
  }

  // Sort by closest to record (highest pct first)
  close.sort((a, b) => b.pct - a.pct)
  return close
}

function RecordWatch() {
  const close = useMemo(() => buildRecordWatch(), [])

  if (close.length === 0) {
    return (
      <div className="record-watch">
        <h2 className="record-watch-title">Chasing Records</h2>
        <p className="record-watch-empty">No athletes currently within striking distance of a school record. Keep pushing!</p>
      </div>
    )
  }

  return (
    <div className="record-watch">
      <h2 className="record-watch-title">Chasing Records</h2>
      <div className="record-watch-list">
        {close.map((c, i) => {
          const slug = findAthleteSlug(c.athlete)
          return (
            <div key={i} className="record-watch-card">
              <div className="record-watch-top">
                <div className="record-watch-athlete">
                  {slug ? (
                    <Link to={`/athlete/${slug}`} className="record-watch-name">{c.athlete}</Link>
                  ) : (
                    <span className="record-watch-name">{c.athlete}</span>
                  )}
                  <span className="record-watch-event">{c.event}</span>
                </div>
                <span className="record-watch-diff">{c.diffText}</span>
              </div>
              <div className="record-watch-bar-wrap">
                <div className="record-watch-bar" style={{ width: `${Math.round(c.pct * 100)}%` }} />
              </div>
              <div className="record-watch-stats">
                <span className="record-watch-sb">Season Best: <strong>{c.seasonBest}</strong></span>
                <span className="record-watch-rec">Record: <strong>{c.record}</strong> ({c.recordHolder}, {c.recordYear || '—'})</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecordSection({ title, data }) {
  return (
    <div className="records-section">
      <h2 className="records-section-title">{title}</h2>
      <div className="records-table-wrap">
        <table className="records-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Record</th>
              <th>Athlete</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {data.map(rec => (
              <tr key={rec.event} className={`${rec.mark === '—' ? 'pending' : ''} ${rec.newRecord ? 'new-record' : ''}`}>
                <td className="event-cell">{rec.event}</td>
                <td className={`mark-cell ${rec.mark !== '—' ? 'has-record' : ''}`}>
                  {rec.mark}
                </td>
                <td className="athlete-cell">{rec.athlete || '\u2014'}</td>
                <td className="year-cell">
                  {rec.year || '\u2014'}
                  {rec.newRecord && <span className="new-record-badge">NEW</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Records() {
  return (
    <div className="page records">
      <div className="page-header">
        <h1 className="page-title">School Records</h1>
        <p className="page-subtitle">Stillwater Christian Track &amp; Field Record Book</p>
      </div>

      <RecordWatch />

      <div className="records-division">
        <h2 className="records-division-title">High School Records</h2>
        <div className="records-grid">
          <RecordSection title="Boys" data={records.highSchool.boys} />
          <RecordSection title="Girls" data={records.highSchool.girls} />
        </div>
      </div>

      <div className="records-division">
        <h2 className="records-division-title">Jr. High Records</h2>
        <div className="records-grid">
          <RecordSection title="Boys" data={records.jrHigh.boys} />
          <RecordSection title="Girls" data={records.jrHigh.girls} />
        </div>
      </div>
    </div>
  )
}

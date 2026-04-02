import { useParams, Link } from 'react-router-dom'
import meetResults from '../data/meetResults.json'
import athletes from '../data/athletes.json'
import { isSchoolRecord } from '../utils/recordCheck'
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
  return (
    <div className="result-row">
      <div className="result-place"><PlaceBadge place={r.place} /></div>
      <div className="result-info">
        <AthleteLink name={r.athlete} />
        <span className="result-grade">{r.grade}th</span>
      </div>
      <div className="result-mark">
        {r.mark}
        {r.pr && <span className="sb-badge" title="Season Best 2026">SB</span>}
        {isSchoolRecord(r.event, r.mark, r.gender, r.grade) && <span className="sr-badge" title="School Record">SR</span>}
      </div>
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

function RelayRow({ r }) {
  const grade = getRelayGrade(r.athletes)
  return (
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
      <div className="result-mark">
        {r.mark}
        {isSchoolRecord(r.event, r.mark, r.gender, grade) && <span className="sr-badge" title="School Record">SR</span>}
      </div>
    </div>
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

      <div className="page-header">
        <h1 className="page-title">{meet.meetName}</h1>
        <p className="page-subtitle">
          {new Date(meet.date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
          })} &middot; {meet.location}
        </p>
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

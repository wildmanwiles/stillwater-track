import { Link } from 'react-router-dom'
import schedule from '../data/schedule.json'
import meetResults from '../data/meetResults.json'
import './Schedule.css'

const MAPS_QUERIES = {
  'Spokane, WA': 'Spokane WA',
  'Eureka, MT': 'Lincoln County High School Eureka MT',
  'Saint Marys, ID': 'Saint Marys Idaho',
  'Bigfork, MT': 'Bigfork High School Bigfork MT',
  'Belgrade, MT': 'Belgrade MT',
  'Wallace, ID': 'Wallace Idaho',
}

function mapsUrl(location) {
  const query = MAPS_QUERIES[location] || location
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export default function Schedule() {
  const sorted = [...schedule].sort((a, b) => new Date(a.date) - new Date(b.date))
  const meetIds = new Set(meetResults.map(m => m.meetId))

  return (
    <div className="page schedule">
      <div className="page-header">
        <h1 className="page-title">Meet Schedule</h1>
        <p className="page-subtitle">2026 Season</p>
      </div>

      <div className="schedule-list">
        {sorted.map(meet => (
          <div key={meet.id} className={`schedule-card ${meet.status}`}>
            <div className="schedule-date-block">
              <span className="sched-month">
                {new Date(meet.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="sched-day">
                {new Date(meet.date + 'T00:00:00').getDate()}
              </span>
            </div>
            <div className="schedule-info">
              <h3>{meet.name}</h3>
              <a
                href={mapsUrl(meet.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="schedule-location-link"
                onClick={e => e.stopPropagation()}
              >
                <svg className="map-pin-icon" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {meet.location}
              </a>
            </div>
            <div className="schedule-actions">
              {meet.status === 'completed' && meetIds.has(meet.id) ? (
                <Link to={`/results/${meet.id}`} className="results-btn">View Results</Link>
              ) : meet.status === 'completed' ? (
                <span className="results-pending">Results Coming Soon</span>
              ) : meet.status === 'cancelled' ? (
                <span className="status-pill cancelled">Cancelled</span>
              ) : (
                <span className={`status-pill ${meet.status}`}>Upcoming</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

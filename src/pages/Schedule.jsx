import schedule from '../data/schedule.json'
import './Schedule.css'

export default function Schedule() {
  const sorted = [...schedule].sort((a, b) => new Date(a.date) - new Date(b.date))

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
              <p className="schedule-location">{meet.location}</p>
            </div>
            <span className={`status-pill ${meet.status}`}>
              {meet.status === 'completed' ? 'Completed' : 'Upcoming'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

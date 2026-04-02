import records from '../data/records.json'
import './Records.css'

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
              <tr key={rec.event} className={rec.mark === 'Record Pending' ? 'pending' : ''}>
                <td className="event-cell">{rec.event}</td>
                <td className={`mark-cell ${rec.mark !== 'Record Pending' ? 'has-record' : ''}`}>
                  {rec.mark}
                </td>
                <td className="athlete-cell">{rec.athlete || '\u2014'}</td>
                <td className="year-cell">{rec.year || '\u2014'}</td>
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
        <h1 className="page-title">🏆 School Records</h1>
        <p className="page-subtitle">Stillwater Christian Track &amp; Field Record Book</p>
        <p className="records-note">All-time school records — coming soon. Records will be added as they are verified.</p>
      </div>

      <div className="records-grid">
        <RecordSection title="Boys" data={records.boys} />
        <RecordSection title="Girls" data={records.girls} />
      </div>
    </div>
  )
}

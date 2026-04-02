import speedBoard from '../data/speedBoard.json'
import './SpeedBoard.css'

const MEDALS = ['🥇', '🥈', '🥉']

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
              <th className="col-num">Best Fly (s)</th>
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
                <td className="col-num fly-cell">{entry.bestFly.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SpeedBoard() {
  return (
    <div className="page speed-board">
      <div className="page-header">
        <h1 className="page-title">⚡ Speed Board</h1>
        <p className="page-subtitle">25M to 10M Fly Leaderboard</p>
      </div>

      <div className="leader-grid">
        <LeaderTable title="Boys" entries={speedBoard.males} />
        <LeaderTable title="Girls" entries={speedBoard.females} />
      </div>
    </div>
  )
}

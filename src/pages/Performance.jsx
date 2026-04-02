import { useState } from 'react'
import speedBoard from '../data/speedBoard.json'
import './Performance.css'

const MEDALS = ['🥇', '🥈', '🥉']

const TABS = [
  { id: 'sprints', label: 'Sprints', icon: '🏃', desc: 'Short distance events including 100m, 200m, and 400m results.' },
  { id: 'throws', label: 'Throws', icon: '💪', desc: 'Shot Put, Discus, and Javelin results.' },
  { id: 'jumps', label: 'Jumps', icon: '🦘', desc: 'High Jump, Long Jump, and Triple Jump results.' },
  { id: 'hurdles', label: 'Hurdles', icon: '🚧', desc: '110m Hurdles and 300m Hurdles results.' },
  { id: 'distance', label: 'Distance', icon: '🏅', desc: '800m, 1600m, 3200m, and distance relay results.' },
  { id: 'relays', label: 'Relays', icon: '🏃‍♂️', desc: '4x100m, 4x200m, 4x400m, 4x800m relay results. Each relay entry will show the four athletes on the team and their combined time.' },
  { id: 'speed-board', label: 'Speed Board', icon: '⚡', desc: '25M to 10M Fly Leaderboard — raw speed rankings.' },
]

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

function EmptyState({ tab }) {
  return (
    <div className="perf-empty">
      <span className="perf-empty-icon">{tab.icon}</span>
      <h3>{tab.label}</h3>
      <p className="perf-empty-desc">{tab.desc}</p>
      <p className="perf-empty-msg">Meet results will appear here after results are entered.</p>
    </div>
  )
}

export default function Performance() {
  const [activeTab, setActiveTab] = useState('speed-board')
  const current = TABS.find(t => t.id === activeTab)

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
        ) : (
          <EmptyState tab={current} />
        )}
      </div>
    </div>
  )
}

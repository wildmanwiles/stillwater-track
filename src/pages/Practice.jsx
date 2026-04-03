import { useState } from 'react'
import speedBoard from '../data/speedBoard.json'
import './Practice.css'

const MEDALS = ['🥇', '🥈', '🥉']

const TABS = [
  { id: 'speed-board', label: 'Speed Board', icon: '⚡' },
  { id: 'sprint-times', label: 'Sprint Times', icon: '🏃' },
  { id: 'field-measurements', label: 'Field Measurements', icon: '📏' },
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

export default function Practice() {
  const [activeTab, setActiveTab] = useState('speed-board')

  return (
    <div className="page practice">
      <div className="page-header">
        <h1 className="page-title">Practice</h1>
        <p className="page-subtitle">Training Data &amp; Speed Rankings</p>
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
        {activeTab === 'speed-board' && (
          <div className="leader-grid">
            <LeaderTable title="Boys" entries={speedBoard.males} />
            <LeaderTable title="Girls" entries={speedBoard.females} />
          </div>
        )}

        {activeTab === 'sprint-times' && (
          <div className="practice-placeholder">
            <span className="practice-placeholder-icon">🏃</span>
            <p>Sprint times from practice sessions will be added here throughout the season.</p>
          </div>
        )}

        {activeTab === 'field-measurements' && (
          <div className="practice-placeholder">
            <span className="practice-placeholder-icon">📏</span>
            <p>Field event measurements from practice will be added here throughout the season.</p>
          </div>
        )}
      </div>
    </div>
  )
}

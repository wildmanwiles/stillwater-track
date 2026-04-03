import { useState } from 'react'
import practiceData from '../data/practiceData.json'
import './Practice.css'

const MEDALS = ['🥇', '🥈', '🥉']

const TABS = [
  { id: 'speed-board', label: 'Speed Board', icon: '⚡' },
  { id: 'sprint-times', label: 'Sprint Times', icon: '🏃' },
  { id: 'field-measurements', label: 'Field Measurements', icon: '📏' },
]

const WORKOUT_DISTANCES = {
  '10x40M': 40,
  '5x100M': 100,
  '10M Fly': 10,
  '25M to 10M Fly': 10,
  '20M Competitive Fly': 20,
  '200x3 / 600M Predictor': 200,
}

const SOURCE_LABELS = {
  '10x40M': '40M',
  '5x100M': '100M',
  '10M Fly': '10M Fly',
  '25M to 10M Fly': '25M Fly',
  '20M Competitive Fly': '20M Fly',
  '200x3 / 600M Predictor': '200M',
}

function getBestTime(a) {
  if (a.best != null) return a.best
  if (a.best100 != null) return a.best100
  if (a.best200 != null) return a.best200
  return null
}

function getAthleteMph(a, workoutType) {
  if (a.mph != null) return a.mph
  if (a.avgMph != null) return a.avgMph
  const best = getBestTime(a)
  if (best == null) return null
  const dist = WORKOUT_DISTANCES[workoutType]
  if (!dist) return null
  return (dist / best) * 2.23694
}

function computeSpeedBoard() {
  const athleteMap = {}

  for (const workout of practiceData.workouts) {
    for (const session of workout.sessions) {
      for (const a of session.athletes) {
        const mph = getAthleteMph(a, workout.type)
        if (mph == null) continue
        const key = a.name
        if (!athleteMap[key] || mph > athleteMap[key].mph) {
          athleteMap[key] = {
            name: a.name,
            grade: a.grade,
            gender: a.gender,
            mph,
            source: workout.type,
          }
        }
      }
    }
  }

  const all = Object.values(athleteMap)
  return {
    males: all.filter(a => a.gender === 'M'),
    females: all.filter(a => a.gender === 'F'),
  }
}

const speedBoard = computeSpeedBoard()

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
                <td className="col-num mph-cell">
                  <span>{entry.mph.toFixed(1)}</span>
                  <span className="speed-source">{SOURCE_LABELS[entry.source] || entry.source}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getSortKey(a) {
  if (a.best != null) return a.best
  if (a.best100 != null) return a.best100
  if (a.best200 != null) return a.best200
  return Infinity
}

function getSummaryHeaders(workout) {
  const sample = workout.sessions[0]?.athletes[0]
  if (!sample) return []
  const cols = []
  if ('best' in sample || 'best100' in sample || 'best200' in sample) cols.push('Best')
  if ('avg' in sample) cols.push('Avg')
  cols.push('MPH')
  if ('predicted400' in sample) cols.push('Pred 400')
  return cols
}

function getSummaryValues(a, workout) {
  const vals = []
  if ('best' in a) vals.push(a.best != null ? a.best : '—')
  else if ('best100' in a) vals.push(a.best100 != null ? a.best100 : '—')
  else if ('best200' in a) vals.push(a.best200 != null ? a.best200 : '—')
  if ('avg' in a) vals.push(a.avg != null ? (Number.isInteger(a.avg) ? a.avg : a.avg.toFixed(3)) : '—')
  const mph = getAthleteMph(a, workout.type)
  vals.push(mph != null ? mph.toFixed(1) : '—')
  if ('predicted400' in a) vals.push(a.predicted400 || '—')
  return vals
}

function WorkoutTable({ title, athletes, workout }) {
  const sorted = [...athletes].sort((a, b) => getSortKey(a) - getSortKey(b))
  const timeCols = sorted[0]?.splits || sorted[0]?.flies || []
  const numTimes = timeCols.length
  const summaryHeaders = getSummaryHeaders(workout)

  return (
    <div className="workout-section">
      <h3 className="workout-gender-title">{title}</h3>
      <div className="workout-table-wrap">
        <table className="workout-table">
          <thead>
            <tr>
              <th className="col-rank">#</th>
              <th className="col-name">Athlete</th>
              <th className="col-grade">Gr</th>
              {Array.from({ length: numTimes }, (_, i) => (
                <th key={i} className="col-time">{i + 1}</th>
              ))}
              {summaryHeaders.map(h => (
                <th key={h} className="col-summary">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => {
              const times = a.splits || a.flies || []
              const summaryVals = getSummaryValues(a, workout)
              return (
                <tr key={a.name} className={i < 3 ? `top-${i + 1}` : ''}>
                  <td className="col-rank">
                    {i < 3 ? <span className="medal">{MEDALS[i]}</span> : <span className="rank-num">{i + 1}</span>}
                  </td>
                  <td className="col-name athlete-cell">{a.name}</td>
                  <td className="col-grade"><span className="grade-badge">{a.grade}</span></td>
                  {times.map((t, j) => (
                    <td key={j} className={`col-time ${t == null ? 'dnf' : ''}`}>
                      {t != null ? t : 'DNF'}
                    </td>
                  ))}
                  {summaryVals.map((v, j) => (
                    <td key={j} className="col-summary">{v}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SprintTimes() {
  const workouts = practiceData.workouts
  const [workoutIdx, setWorkoutIdx] = useState(0)
  const workout = workouts[workoutIdx]
  const session = workout.sessions[0]

  const girls = session.athletes.filter(a => a.gender === 'F')
  const boys = session.athletes.filter(a => a.gender === 'M')

  return (
    <div className="sprint-times">
      <div className="workout-tabs">
        {workouts.map((w, i) => (
          <button
            key={w.type}
            className={`workout-tab ${workoutIdx === i ? 'active' : ''}`}
            onClick={() => setWorkoutIdx(i)}
          >
            {w.type}
          </button>
        ))}
      </div>

      <div className="workout-info">
        <p className="workout-desc">{workout.description}</p>
        <span className="workout-date">
          {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          })}
        </span>
      </div>

      {girls.length > 0 && <WorkoutTable title="Girls" athletes={girls} workout={workout} />}
      {boys.length > 0 && <WorkoutTable title="Boys" athletes={boys} workout={workout} />}
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

        {activeTab === 'sprint-times' && <SprintTimes />}

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

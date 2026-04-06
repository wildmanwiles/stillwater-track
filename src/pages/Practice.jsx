import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { isCoach } from '../utils/auth'
import practiceData from '../data/practiceData.json'
import './Practice.css'

const MEDALS = ['🥇', '🥈', '🥉']

const TABS = [
  { id: 'speed-board', label: 'Speed Board', icon: '⚡' },
  { id: 'sprint-times', label: 'Sprint Times', icon: '🏃' },
  { id: 'field-measurements', label: 'Field Measurements', icon: '📏' },
]

const WORKOUT_DISTANCES = {
  '10x40M': 40, '5x100M': 100, '10M Fly': 10, '25M to 10M Fly': 10,
  '20M Competitive Fly': 20, '200x3 / 600M Predictor': 200, '5x40M Fly': 40,
}

const SOURCE_LABELS = {
  '10x40M': '40M', '5x100M': '100M', '10M Fly': '10M Fly',
  '25M to 10M Fly': '25M Fly', '20M Competitive Fly': '20M Fly',
  '200x3 / 600M Predictor': '200M', '5x40M Fly': '40M Fly',
}

const CHART_COLORS = [
  '#1B3A6B', '#B8860B', '#dc2626', '#16a34a', '#7c3aed',
  '#ea580c', '#0891b2', '#db2777', '#4f46e5', '#65a30d',
  '#0d9488', '#9333ea',
]

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
  let latestDate = ''
  for (const workout of practiceData.workouts) {
    for (const session of workout.sessions) {
      if (session.date > latestDate) latestDate = session.date
    }
  }

  const athleteMap = {}
  const prevMap = {}

  for (const workout of practiceData.workouts) {
    for (const session of workout.sessions) {
      for (const a of session.athletes) {
        const mph = getAthleteMph(a, workout.type)
        if (mph == null) continue
        const key = a.name

        if (!athleteMap[key] || mph > athleteMap[key].mph) {
          athleteMap[key] = {
            name: a.name, grade: a.grade, gender: a.gender,
            mph, source: workout.type, date: session.date,
          }
        }

        if (session.date !== latestDate) {
          if (!prevMap[key] || mph > prevMap[key]) prevMap[key] = mph
        }
      }
    }
  }

  const all = Object.values(athleteMap).map(entry => ({
    ...entry,
    isNewPb: entry.date === latestDate && (!prevMap[entry.name] || entry.mph > prevMap[entry.name]),
  }))

  return { males: all.filter(a => a.gender === 'M'), females: all.filter(a => a.gender === 'F') }
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
                  {i < 3 ? <span className="medal">{MEDALS[i]}</span> : <span className="rank-num">{i + 1}</span>}
                </td>
                <td className="athlete-cell">{entry.name}</td>
                <td>{entry.grade}</td>
                <td className="col-num mph-cell">
                  <span>{entry.mph.toFixed(1)}{entry.isNewPb && <span className="new-pb-badge">NEW PB</span>}</span>
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

function formatPred400(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds - mins * 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs.toFixed(2)}`
}

function getPred400(a, workoutType) {
  const times = a.splits || a.flies || []
  const valid = times.filter(s => s != null)
  if (workoutType === '10x40M') {
    if (valid.length !== 10) return null
    return formatPred400(valid.reduce((s, v) => s + v, 0))
  }
  if (workoutType === '5x100M') {
    if (valid.length < 5) return null
    return formatPred400(valid.reduce((s, v) => s + v, 0) * 0.93)
  }
  if (workoutType === '200x3 / 600M Predictor') {
    if (valid.length < 3) return null
    return formatPred400(valid.reduce((s, v) => s + v, 0) * 0.667 + 2)
  }
  if (workoutType === '5x40M Fly') {
    if (valid.length === 0) return null
    return formatPred400((valid.reduce((s, v) => s + v, 0) / valid.length) * 10)
  }
  return null
}

const PRED400_TYPES = new Set(['10x40M', '5x100M', '200x3 / 600M Predictor', '5x40M Fly'])

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
  return vals
}

function WorkoutTable({ title, athletes, workout }) {
  const sorted = [...athletes].sort((a, b) => getSortKey(a) - getSortKey(b))
  const timeCols = sorted[0]?.splits || sorted[0]?.flies || []
  const numTimes = timeCols.length
  const summaryHeaders = getSummaryHeaders(workout)
  const showPred = PRED400_TYPES.has(workout.type)

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
              {showPred && <th className="col-time">PRED 400</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => {
              const times = a.splits || a.flies || []
              const summaryVals = getSummaryValues(a, workout)
              const pred = showPred ? getPred400(a, workout.type) : null
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
                  {showPred && (
                    <td className={`col-time ${pred == null ? 'dnf' : ''}`}>
                      {pred != null ? pred : '—'}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SpeedProgressionChart({ gender }) {
  // Build MPH progression across ALL workout types for each athlete
  const points = []
  for (const workout of practiceData.workouts) {
    for (const session of workout.sessions) {
      for (const a of session.athletes) {
        if (a.gender !== gender) continue
        const mph = getAthleteMph(a, workout.type)
        if (mph == null) continue
        points.push({ name: a.name, date: session.date, mph })
      }
    }
  }

  // Get unique athletes and dates
  const athleteNames = [...new Set(points.map(p => p.name))]
  const dates = [...new Set(points.map(p => p.date))].sort()

  // For each date, pick the best mph per athlete across all workout types on that date
  const chartData = dates.map(date => {
    const row = { date: new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    for (const name of athleteNames) {
      const matching = points.filter(p => p.date === date && p.name === name)
      if (matching.length > 0) {
        row[name] = Math.max(...matching.map(m => m.mph))
      }
    }
    return row
  })

  // Sort athletes by their best MPH for color assignment (best gets gold)
  const athleteBest = athleteNames.map(n => ({
    name: n,
    best: Math.max(...points.filter(p => p.name === n).map(p => p.mph)),
  })).sort((a, b) => b.best - a.best)

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} label={{ value: 'MPH', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {athleteBest.map((a, i) => (
            <Line
              key={a.name}
              type="monotone"
              dataKey={a.name}
              stroke={i === 0 ? '#B8860B' : CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={i === 0 ? 3 : 1.5}
              dot={{ r: 3 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function SprintTimes() {
  const workouts = practiceData.workouts
  const [workoutIdx, setWorkoutIdx] = useState(0)
  const [showChart, setShowChart] = useState(false)
  const [chartGender, setChartGender] = useState('M')
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

      <div className="chart-toggle-row">
        <button
          className={`chart-toggle-btn ${!showChart ? 'active' : ''}`}
          onClick={() => setShowChart(false)}
        >
          Table
        </button>
        <button
          className={`chart-toggle-btn ${showChart ? 'active' : ''}`}
          onClick={() => setShowChart(true)}
        >
          Chart
        </button>
        {showChart && (
          <div className="chart-gender-filter">
            <button className={`chart-gender-btn ${chartGender === 'M' ? 'active' : ''}`} onClick={() => setChartGender('M')}>Boys</button>
            <button className={`chart-gender-btn ${chartGender === 'F' ? 'active' : ''}`} onClick={() => setChartGender('F')}>Girls</button>
          </div>
        )}
      </div>

      {showChart ? (
        <WorkoutChart workout={workout} gender={chartGender} />
      ) : (
        <>
          {girls.length > 0 && <WorkoutTable title="Girls" athletes={girls} workout={workout} />}
          {boys.length > 0 && <WorkoutTable title="Boys" athletes={boys} workout={workout} />}
        </>
      )}
    </div>
  )
}

function WorkoutChart({ workout, gender }) {
  const session = workout.sessions[0]
  const athletes = session.athletes.filter(a => a.gender === gender)

  if (athletes.length === 0) {
    return <div className="chart-empty">No data for this gender in this workout</div>
  }

  // Build bar chart data (single session = comparison bars)
  const sorted = [...athletes].sort((a, b) => {
    const mphA = getAthleteMph(a, workout.type) || 0
    const mphB = getAthleteMph(b, workout.type) || 0
    return mphB - mphA
  })

  const maxMph = Math.max(...sorted.map(a => getAthleteMph(a, workout.type) || 0))

  return (
    <div className="bar-chart">
      {sorted.map((a, i) => {
        const mph = getAthleteMph(a, workout.type)
        if (mph == null) return null
        const pct = (mph / maxMph) * 100
        return (
          <div key={a.name} className={`bar-row ${i < 3 ? `top-${i + 1}` : ''}`}>
            <span className="bar-name">{a.name}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${pct}%` }}>
                <span className="bar-value">{mph.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Practice() {
  const [activeTab, setActiveTab] = useState('speed-board')
  const [speedChart, setSpeedChart] = useState(false)
  const [speedChartGender, setSpeedChartGender] = useState('M')

  return (
    <div className="page practice">
      <div className="page-header">
        <h1 className="page-title">Practice</h1>
        <p className="page-subtitle">Training Data &amp; Speed Rankings</p>
        {isCoach() && (
          <Link to="/admin" className="coach-edit-btn" style={{ marginTop: '0.75rem' }}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" /></svg>
            Add Practice Session
          </Link>
        )}
      </div>

      <a href="https://www.stillwaterchristianschool.org/calendar/track-field/" target="_blank" rel="noopener noreferrer" className="practice-cal-banner">
        <svg className="practice-cal-icon" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        <div className="practice-cal-text">
          <span className="practice-cal-title">Practice Schedule &amp; Locations</span>
          <span className="practice-cal-sub">View the full track &amp; field calendar on the SCS website</span>
        </div>
        <svg className="practice-cal-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </a>

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
          <>
            <div className="chart-toggle-row">
              <button className={`chart-toggle-btn ${!speedChart ? 'active' : ''}`} onClick={() => setSpeedChart(false)}>Table</button>
              <button className={`chart-toggle-btn ${speedChart ? 'active' : ''}`} onClick={() => setSpeedChart(true)}>Chart</button>
              {speedChart && (
                <div className="chart-gender-filter">
                  <button className={`chart-gender-btn ${speedChartGender === 'M' ? 'active' : ''}`} onClick={() => setSpeedChartGender('M')}>Boys</button>
                  <button className={`chart-gender-btn ${speedChartGender === 'F' ? 'active' : ''}`} onClick={() => setSpeedChartGender('F')}>Girls</button>
                </div>
              )}
            </div>
            {speedChart ? (
              <SpeedProgressionChart gender={speedChartGender} />
            ) : (
              <div className="leader-grid">
                <LeaderTable title="Boys" entries={speedBoard.males} />
                <LeaderTable title="Girls" entries={speedBoard.females} />
              </div>
            )}
          </>
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

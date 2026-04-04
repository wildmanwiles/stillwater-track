import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { isCoach } from '../utils/auth'
import athletes from '../data/athletes.json'
import AthletePhoto from '../components/AthletePhoto'
import './Roster.css'

const GRADES = [7, 8, 9, 10, 11, 12]

export default function Roster() {
  const [gender, setGender] = useState('all')
  const [grade, setGrade] = useState('all')
  const [role, setRole] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return athletes
      .filter(a => a.active !== false)
      .filter(a => gender === 'all' || a.gender === gender)
      .filter(a => grade === 'all' || a.grade === Number(grade))
      .filter(a => role === 'all' || a.role === role)
      .filter(a => {
        if (!q) return true
        return a.first.toLowerCase().includes(q) || a.last.toLowerCase().includes(q)
      })
      .sort((a, b) => a.last.localeCompare(b.last))
  }, [gender, grade, role, search])

  const count = filtered.length

  return (
    <div className="page roster">
      <div className="page-header">
        <h1 className="page-title">Athlete Roster</h1>
        <p className="page-subtitle">{count} member{count !== 1 ? 's' : ''}</p>
        {isCoach() && (
          <Link to="/admin" className="coach-edit-btn" style={{ marginTop: '0.75rem' }}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            Edit Roster
          </Link>
        )}
      </div>

      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search athletes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
            &times;
          </button>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Gender</label>
          <div className="filter-buttons">
            {[['all', 'All'], ['M', 'Boys'], ['F', 'Girls']].map(([val, label]) => (
              <button
                key={val}
                className={gender === val ? 'active' : ''}
                onClick={() => setGender(val)}
              >{label}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Grade</label>
          <select value={grade} onChange={e => setGrade(e.target.value)}>
            <option value="all">All Grades</option>
            {GRADES.map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Role</label>
          <div className="filter-buttons">
            {[['all', 'All'], ['athlete', 'Athletes'], ['manager', 'Managers']].map(([val, label]) => (
              <button
                key={val}
                className={role === val ? 'active' : ''}
                onClick={() => setRole(val)}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="roster-list">
        {filtered.length === 0 && (
          <div className="roster-empty">No athletes found</div>
        )}
        {filtered.map(athlete => (
          <Link key={athlete.id} to={`/athlete/${athlete.first.toLowerCase()}-${athlete.last.toLowerCase()}`} className="roster-row">
            <AthletePhoto slug={`${athlete.first}-${athlete.last}`.toLowerCase()} size="small" />
            <div className="roster-name">
              {athlete.last}, {athlete.first}
            </div>
            <span className="grade-badge">
              {athlete.grade}th
            </span>
            {athlete.role === 'manager' ? (
              <span className="manager-badge">Manager</span>
            ) : (
              athlete.events.length > 0 && (
                <div className="roster-events">
                  {athlete.events.map(e => (
                    <span key={e} className="event-tag">{e}</span>
                  ))}
                </div>
              )
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import athletes from '../data/athletes.json'
import './Roster.css'

const GRADES = [7, 8, 9, 10, 11, 12]

export default function Roster() {
  const [gender, setGender] = useState('all')
  const [grade, setGrade] = useState('all')
  const [role, setRole] = useState('all')

  const filtered = useMemo(() => {
    return athletes
      .filter(a => a.active !== false)
      .filter(a => gender === 'all' || a.gender === gender)
      .filter(a => grade === 'all' || a.grade === Number(grade))
      .filter(a => role === 'all' || a.role === role)
      .sort((a, b) => a.last.localeCompare(b.last))
  }, [gender, grade, role])

  const count = filtered.length

  return (
    <div className="page roster">
      <div className="page-header">
        <h1 className="page-title">Athlete Roster</h1>
        <p className="page-subtitle">{count} member{count !== 1 ? 's' : ''}</p>
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
        {filtered.map(athlete => (
          <Link key={athlete.id} to={`/athlete/${athlete.first.toLowerCase()}-${athlete.last.toLowerCase()}`} className="roster-row">
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

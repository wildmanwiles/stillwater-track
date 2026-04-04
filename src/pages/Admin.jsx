import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isCoach } from '../utils/auth'
import announcements from '../data/announcements.json'
import athletes from '../data/athletes.json'
import records from '../data/records.json'
import meetResults from '../data/meetResults.json'
import galleryData from '../data/gallery.json'
import './Admin.css'

const ADMIN_CARDS = [
  { id: 'announcements', icon: '\uD83D\uDCE2', title: 'Announcements', desc: 'Edit home page announcements' },
  { id: 'gallery', icon: '\uD83D\uDCF7', title: 'Gallery Manager', desc: 'Upload and manage meet photos' },
  { id: 'practice', icon: '\u23F1\uFE0F', title: 'Practice Data Entry', desc: 'Add practice timing results' },
  { id: 'roster', icon: '\uD83D\uDC65', title: 'Roster Manager', desc: 'Edit athlete info and events' },
  { id: 'meet-results', icon: '\uD83C\uDFC6', title: 'Meet Results Entry', desc: 'Add meet results' },
  { id: 'records', icon: '\u2B50', title: 'Records Manager', desc: 'Update school records' },
]

const WORKOUT_TYPES = ['10x40M', '5x100M', '10M Fly', '25M to 10M Fly', '20M Competitive Fly', '200x3 / 600M Predictor', '5x40M Fly']

const DISABLED_TOOLTIP = 'Database connection required. Coming in next update.'

function DisabledButton({ children, className = '' }) {
  return (
    <div className="disabled-btn-wrap">
      <button className={`admin-save-btn disabled ${className}`} disabled>{children}</button>
      <span className="disabled-tooltip">{DISABLED_TOOLTIP}</span>
    </div>
  )
}

function AnnouncementsPanel() {
  const sorted = [...announcements].sort((a, b) => new Date(b.date) - new Date(a.date))
  const [title, setTitle] = useState(sorted[0]?.title || '')
  const [body, setBody] = useState(sorted[0]?.body || '')
  const [date, setDate] = useState(sorted[0]?.date || '')

  return (
    <div className="admin-panel-detail">
      <h3 className="admin-detail-title">Edit Announcements</h3>
      <div className="admin-form">
        <label className="admin-label">
          Title
          <input type="text" className="admin-input" value={title} onChange={e => setTitle(e.target.value)} />
        </label>
        <label className="admin-label">
          Date
          <input type="date" className="admin-input" value={date} onChange={e => setDate(e.target.value)} />
        </label>
        <label className="admin-label">
          Body
          <textarea className="admin-textarea" rows={4} value={body} onChange={e => setBody(e.target.value)} />
        </label>
        <DisabledButton>Save Announcement</DisabledButton>
      </div>

      <h4 className="admin-sub-title">Existing Announcements</h4>
      <div className="admin-list">
        {sorted.map(a => (
          <div key={a.id} className="admin-list-item">
            <div className="admin-list-main">
              <span className="admin-list-name">{a.title}</span>
              <span className="admin-list-meta">{a.date}</span>
            </div>
            <p className="admin-list-body">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function GalleryPanel() {
  const [selectedMeet, setSelectedMeet] = useState(galleryData[0]?.id || '')
  const meet = galleryData.find(m => m.id === selectedMeet)

  return (
    <div className="admin-panel-detail">
      <h3 className="admin-detail-title">Gallery Manager</h3>
      <div className="admin-form">
        <label className="admin-label">
          Meet
          <select className="admin-select" value={selectedMeet} onChange={e => setSelectedMeet(e.target.value)}>
            {galleryData.map(m => (
              <option key={m.id} value={m.id}>{m.name} — {m.date}</option>
            ))}
          </select>
        </label>

        <div className="admin-upload-area">
          <div className="admin-upload-icon">{'\uD83D\uDCC1'}</div>
          <p className="admin-upload-text">Drag & drop photos here, or click to browse</p>
          <DisabledButton className="small">Upload Photos</DisabledButton>
        </div>

        {meet && (
          <>
            <h4 className="admin-sub-title">Current Photos ({meet.photos.length})</h4>
            <div className="admin-photo-grid">
              {meet.photos.slice(0, 12).map((photo, i) => (
                <div key={i} className="admin-photo-item">
                  <img src={`${meet.photoFolder}${photo}`} alt={`Photo ${i + 1}`} loading="lazy" />
                  <div className="disabled-btn-wrap">
                    <button className="admin-photo-delete" disabled>x</button>
                    <span className="disabled-tooltip">{DISABLED_TOOLTIP}</span>
                  </div>
                </div>
              ))}
              {meet.photos.length > 12 && (
                <div className="admin-photo-more">+{meet.photos.length - 12} more</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PracticePanel() {
  const [workoutType, setWorkoutType] = useState(WORKOUT_TYPES[0])
  const [date, setDate] = useState('')
  const [rows, setRows] = useState([
    { name: '', splits: ['', '', ''] },
    { name: '', splits: ['', '', ''] },
    { name: '', splits: ['', '', ''] },
  ])

  function addRow() {
    setRows([...rows, { name: '', splits: ['', '', ''] }])
  }

  function updateRow(idx, field, value) {
    const updated = [...rows]
    updated[idx] = { ...updated[idx], [field]: value }
    setRows(updated)
  }

  function updateSplit(rowIdx, splitIdx, value) {
    const updated = [...rows]
    const splits = [...updated[rowIdx].splits]
    splits[splitIdx] = value
    updated[rowIdx] = { ...updated[rowIdx], splits }
    setRows(updated)
  }

  return (
    <div className="admin-panel-detail">
      <h3 className="admin-detail-title">Practice Data Entry</h3>
      <div className="admin-form">
        <div className="admin-form-row">
          <label className="admin-label">
            Workout Type
            <select className="admin-select" value={workoutType} onChange={e => setWorkoutType(e.target.value)}>
              {WORKOUT_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
              <option value="new">+ New Workout Type</option>
            </select>
          </label>
          <label className="admin-label">
            Date
            <input type="date" className="admin-input" value={date} onChange={e => setDate(e.target.value)} />
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-entry-table">
            <thead>
              <tr>
                <th>Athlete</th>
                <th>Split 1</th>
                <th>Split 2</th>
                <th>Split 3</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <input type="text" className="admin-cell-input name" placeholder="Athlete name" value={row.name} onChange={e => updateRow(i, 'name', e.target.value)} />
                  </td>
                  {row.splits.map((s, j) => (
                    <td key={j}>
                      <input type="text" className="admin-cell-input" placeholder="0.00" value={s} onChange={e => updateSplit(i, j, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="admin-add-row-btn" onClick={addRow}>+ Add Athlete</button>
        <DisabledButton>Save Session</DisabledButton>
      </div>
    </div>
  )
}

function RosterPanel() {
  const [editId, setEditId] = useState(null)
  const sorted = [...athletes].filter(a => a.active !== false).sort((a, b) => a.last.localeCompare(b.last))

  return (
    <div className="admin-panel-detail">
      <h3 className="admin-detail-title">Roster Manager</h3>
      <div className="admin-roster-list">
        {sorted.map(a => (
          <div key={a.id} className={`admin-roster-item ${editId === a.id ? 'editing' : ''}`}>
            <div className="admin-roster-row">
              <span className="admin-roster-name">{a.last}, {a.first}</span>
              <span className="admin-roster-meta">Gr {a.grade} &middot; {a.gender === 'M' ? 'Boys' : 'Girls'}</span>
              <button className="admin-edit-btn" onClick={() => setEditId(editId === a.id ? null : a.id)}>
                {editId === a.id ? 'Close' : 'Edit'}
              </button>
            </div>
            {editId === a.id && (
              <div className="admin-roster-edit">
                <div className="admin-form-row">
                  <label className="admin-label">
                    First Name
                    <input type="text" className="admin-input" defaultValue={a.first} />
                  </label>
                  <label className="admin-label">
                    Last Name
                    <input type="text" className="admin-input" defaultValue={a.last} />
                  </label>
                </div>
                <div className="admin-form-row">
                  <label className="admin-label">
                    Grade
                    <select className="admin-select" defaultValue={a.grade}>
                      {[7, 8, 9, 10, 11, 12].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </label>
                  <label className="admin-label">
                    Gender
                    <select className="admin-select" defaultValue={a.gender}>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </label>
                </div>
                <label className="admin-label">
                  Events (comma-separated)
                  <input type="text" className="admin-input" defaultValue={a.events?.join(', ')} />
                </label>
                <DisabledButton>Save Changes</DisabledButton>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function MeetResultsPanel() {
  const allEvents = [...new Set(meetResults.flatMap(m => m.results.map(r => r.event)))]

  return (
    <div className="admin-panel-detail">
      <h3 className="admin-detail-title">Meet Results Entry</h3>
      <div className="admin-form">
        <label className="admin-label">
          Meet
          <select className="admin-select">
            {meetResults.map(m => <option key={m.meetId} value={m.meetId}>{m.meetName} — {m.date}</option>)}
            <option value="new">+ Add New Meet</option>
          </select>
        </label>
        <label className="admin-label">
          Event
          <select className="admin-select">
            {allEvents.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <div className="admin-form-row">
          <label className="admin-label">
            Athlete
            <input type="text" className="admin-input" placeholder="Athlete name" />
          </label>
          <label className="admin-label">
            Time / Mark
            <input type="text" className="admin-input" placeholder="e.g. 12.34 or 15'6.5&quot;" />
          </label>
          <label className="admin-label">
            Place
            <input type="number" className="admin-input" placeholder="1" min="1" />
          </label>
        </div>
        <DisabledButton>Save Result</DisabledButton>
      </div>
    </div>
  )
}

function RecordsPanel() {
  const [division, setDivision] = useState('highSchool')
  const [gender, setGender] = useState('boys')
  const data = records[division]?.[gender] || []

  return (
    <div className="admin-panel-detail">
      <h3 className="admin-detail-title">Records Manager</h3>
      <div className="admin-form">
        <div className="admin-form-row">
          <label className="admin-label">
            Division
            <select className="admin-select" value={division} onChange={e => setDivision(e.target.value)}>
              <option value="highSchool">High School</option>
              <option value="jrHigh">Jr. High</option>
            </select>
          </label>
          <label className="admin-label">
            Gender
            <select className="admin-select" value={gender} onChange={e => setGender(e.target.value)}>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
            </select>
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-entry-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Mark</th>
                <th>Athlete</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              {data.map((rec, i) => (
                <tr key={i}>
                  <td><span className="admin-cell-label">{rec.event}</span></td>
                  <td><input type="text" className="admin-cell-input" defaultValue={rec.mark} /></td>
                  <td><input type="text" className="admin-cell-input" defaultValue={rec.athlete} /></td>
                  <td><input type="text" className="admin-cell-input small" defaultValue={rec.year || ''} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DisabledButton>Save Records</DisabledButton>
      </div>
    </div>
  )
}

const PANELS = {
  announcements: AnnouncementsPanel,
  gallery: GalleryPanel,
  practice: PracticePanel,
  roster: RosterPanel,
  'meet-results': MeetResultsPanel,
  records: RecordsPanel,
}

export default function Admin() {
  const [activePanel, setActivePanel] = useState(null)

  if (!isCoach()) {
    return <Navigate to="/" replace />
  }

  const PanelComponent = activePanel ? PANELS[activePanel] : null

  return (
    <div className="page admin">
      <div className="page-header">
        <h1 className="page-title">
          <svg className="admin-title-icon" viewBox="0 0 20 20" fill="currentColor" width="28" height="28">
            <path fillRule="evenodd" d="M10 1l3.09 1.545a8 8 0 010 14.91L10 19l-3.09-1.545a8 8 0 010-14.91L10 1zm0 2.07L7.68 4.3a6 6 0 000 11.4L10 16.93l2.32-1.23a6 6 0 000-11.4L10 3.07z" clipRule="evenodd" />
          </svg>
          Coach Admin Panel
        </h1>
        <p className="page-subtitle">Manage team data and content</p>
      </div>

      <div className="admin-banner">
        <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p>Admin features are being built. Forms are visible for preview but saving requires database setup (coming soon). For now, contact Claude to make data changes.</p>
      </div>

      {!activePanel ? (
        <div className="admin-cards">
          {ADMIN_CARDS.map(card => (
            <button key={card.id} className="admin-card" onClick={() => setActivePanel(card.id)}>
              <span className="admin-card-icon">{card.icon}</span>
              <div className="admin-card-info">
                <span className="admin-card-title">{card.title}</span>
                <span className="admin-card-desc">{card.desc}</span>
              </div>
              <span className="admin-card-badge">Coming Soon</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="admin-panel-content">
          <button className="admin-back-btn" onClick={() => setActivePanel(null)}>
            &larr; Back to Admin Panel
          </button>
          {PanelComponent && <PanelComponent />}
        </div>
      )}
    </div>
  )
}

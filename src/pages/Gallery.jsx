import './Gallery.css'

const PLACEHOLDER_COUNT = 12

export default function Gallery() {
  return (
    <div className="page gallery">
      <div className="page-header">
        <h1 className="page-title">Gallery</h1>
        <p className="page-subtitle">Photos from the 2026 Season</p>
      </div>

      <div className="gallery-meet-section">
        <h2 className="gallery-meet-title">Ice Breaker Relays &mdash; March 28, 2026</h2>
        <div className="gallery-grid">
          {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
            <div key={i} className="gallery-placeholder">
              <svg className="gallery-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <p className="gallery-note">Photos coming soon! Check back after each meet.</p>
    </div>
  )
}

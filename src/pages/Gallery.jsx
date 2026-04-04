import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isCoach } from '../utils/auth'
import galleryData from '../data/gallery.json'
import './Gallery.css'

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)

  function openLightbox(meetIdx, photoIdx) {
    setLightbox({ meetIdx, photoIdx })
  }

  function closeLightbox() {
    setLightbox(null)
  }

  function navigate(dir) {
    if (!lightbox) return
    const meet = galleryData[lightbox.meetIdx]
    const next = lightbox.photoIdx + dir
    if (next >= 0 && next < meet.photos.length) {
      setLightbox({ ...lightbox, photoIdx: next })
    }
  }

  return (
    <div className="page gallery">
      <div className="page-header">
        <h1 className="page-title">Gallery</h1>
        <p className="page-subtitle">Photos from the 2026 Season</p>
        {isCoach() && (
          <Link to="/admin" className="coach-edit-btn" style={{ marginTop: '0.75rem' }}>
            <svg viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
            Upload Photos
          </Link>
        )}
      </div>

      {galleryData.map((meet, mi) => (
        <div key={meet.id} className="gallery-meet-section">
          <h2 className="gallery-meet-title">{meet.name} &mdash; {meet.date}</h2>
          <div className="gallery-grid">
            {meet.photos.map((photo, pi) => (
              <button
                key={photo}
                className="gallery-thumb"
                onClick={() => openLightbox(mi, pi)}
                aria-label={`View photo ${pi + 1}`}
              >
                <img
                  src={`${meet.photoFolder}${photo}`}
                  alt={`${meet.name} photo ${pi + 1}`}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      ))}

      {lightbox && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">&times;</button>
            {lightbox.photoIdx > 0 && (
              <button className="lightbox-nav lightbox-prev" onClick={() => navigate(-1)} aria-label="Previous">&lsaquo;</button>
            )}
            <img
              src={`${galleryData[lightbox.meetIdx].photoFolder}${galleryData[lightbox.meetIdx].photos[lightbox.photoIdx]}`}
              alt={`Photo ${lightbox.photoIdx + 1}`}
              className="lightbox-img"
            />
            {lightbox.photoIdx < galleryData[lightbox.meetIdx].photos.length - 1 && (
              <button className="lightbox-nav lightbox-next" onClick={() => navigate(1)} aria-label="Next">&rsaquo;</button>
            )}
            <div className="lightbox-counter">
              {lightbox.photoIdx + 1} / {galleryData[lightbox.meetIdx].photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

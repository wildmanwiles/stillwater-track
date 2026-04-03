import { useState } from 'react'
import './AthletePhoto.css'

export default function AthletePhoto({ slug, size = 'small' }) {
  const [hasPhoto, setHasPhoto] = useState(true)
  const src = `/athletes/${slug}.jpg`

  return (
    <div className={`athlete-photo ${size}`}>
      {hasPhoto && (
        <img
          src={src}
          alt=""
          onError={() => setHasPhoto(false)}
          className="athlete-photo-img"
        />
      )}
      {!hasPhoto && (
        <svg className="athlete-photo-placeholder" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 10-16 0" />
        </svg>
      )}
    </div>
  )
}

import { useState } from 'react'
import './Login.css'

const PASSWORDS = {
  'SCSco@ch2026!': 'coach',
  'CougarTrack2026': 'member',
}

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const level = PASSWORDS[password]
    if (level) {
      localStorage.setItem('scs-auth', JSON.stringify({ level, ts: Date.now() }))
      onLogin()
    } else {
      setError(true)
      setPassword('')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="login-page">
      <img src="/2021 Cougar Black Transparent.png" alt="" className="login-watermark" />

      <div className="login-content">
        <div className="login-brand">
          <div className="login-logo-wrap">
            <img src="/SCS_CougarsLogo_C_Badge_Line wo Cougar Transparent.png" alt="SCS Cougars" className="login-logo" />
          </div>
          <h1 className="login-title">SCS Cougars<br />Track &amp; Field</h1>
          <p className="login-tagline">Speed &middot; Strength &middot; Character</p>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <h2 className="login-card-title">Team Access</h2>
          <div className={`login-input-wrap ${shake ? 'shake' : ''}`}>
            <svg className="login-lock-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <input
              type="password"
              className="login-input"
              placeholder="Enter team password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              autoFocus
            />
          </div>
          <button type="submit" className="login-btn">Enter</button>
          {error && (
            <p className="login-error">Incorrect password. Contact Coach Wiles for access.</p>
          )}
        </form>

        <p className="login-footer-text">Stillwater Christian School, Kalispell, MT</p>
      </div>
    </div>
  )
}

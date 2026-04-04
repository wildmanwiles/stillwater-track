import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Roster from './pages/Roster'
import Schedule from './pages/Schedule'
import Results from './pages/Performance'
import Gallery from './pages/Gallery'
import Practice from './pages/Practice'
import Records from './pages/Records'
import MeetResults from './pages/MeetResults'
import AthleteProfile from './pages/AthleteProfile'
import Admin from './pages/Admin'
import Login from './pages/Login'
import './App.css'

function isAuthenticated() {
  try {
    const auth = JSON.parse(localStorage.getItem('scs-auth'))
    return auth && (auth.level === 'coach' || auth.level === 'member')
  } catch {
    return false
  }
}

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated)

  const handleLogin = useCallback(() => setAuthed(true), [])
  const handleLogout = useCallback(() => {
    localStorage.removeItem('scs-auth')
    setAuthed(false)
  }, [])

  if (!authed) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/results" element={<Results />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/records" element={<Records />} />
            <Route path="/results/:meetId" element={<MeetResults />} />
            <Route path="/athlete/:slug" element={<AthleteProfile />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

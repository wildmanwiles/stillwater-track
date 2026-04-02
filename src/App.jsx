import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Roster from './pages/Roster'
import Schedule from './pages/Schedule'
import Performance from './pages/Performance'
import Records from './pages/Records'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/records" element={<Records />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

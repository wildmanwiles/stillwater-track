import { Link } from 'react-router-dom'
import './About.css'

const FEATURES = [
  { label: 'Roster', desc: 'Full team roster with athlete profiles and season history' },
  { label: 'Schedule', desc: 'Meet schedule with locations, dates, and countdown timers' },
  { label: 'Results', desc: 'Season best performances across all events, updated after each meet' },
  { label: 'Gallery', desc: 'Photos from meets throughout the season' },
  { label: 'Practice', desc: 'Speed rankings and practice timing data' },
  { label: 'Records', desc: 'All-time school records for both Jr. High and High School' },
]

const STAFF = [
  { role: 'Program Expert / Head Coach', name: 'Tamie Jentz' },
  { role: 'High School Lead Coach (Sprint & Throw)', name: 'Matt Wiles' },
  { role: '7th/8th Grade Lead Coach', name: 'Colleen Dartez' },
  { role: 'Information Officer', name: 'Linnea Wolf' },
  { role: 'Athletic Director', name: 'Mark Pond' },
]

export default function About() {
  return (
    <div className="page about">
      <div className="page-header">
        <h1 className="page-title">About SCS Track &amp; Field App</h1>
        <p className="page-subtitle">Program overview for athletes, families, and administration</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2 className="about-heading">What Is This?</h2>
          <p>
            This app is the digital home for the Stillwater Christian School Cougars Track &amp; Field program.
            It provides athletes, parents, and coaches with one place to find everything related to our track season,
            including meet schedules, results, athlete profiles, practice data, school records, and team photos.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-heading">Why We Built It</h2>
          <p>
            Track and field generates a huge amount of data throughout a season &mdash; from meet results and
            personal records to practice times and speed rankings. This app organizes all of that information
            in one accessible, mobile-friendly location so that families can follow their athletes' progress
            and coaches can make better decisions with real data.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-heading">How It Works</h2>
          <p>
            The app is password-protected and available only to current Stillwater track families and coaches.
            Athletes and parents receive a team access code at the start of the season. Coaches have a separate
            admin login with additional management capabilities.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-heading">What You Can Find Here</h2>
          <div className="about-features">
            {FEATURES.map(f => (
              <div key={f.label} className="about-feature">
                <span className="about-feature-label">{f.label}</span>
                <span className="about-feature-desc">{f.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2 className="about-heading">Integration with School Platforms</h2>
          <p>
            This app is designed to complement Stillwater Christian School's existing athletics communication.
            It is not a replacement for school email, the SCS website, or Athletic.net. Meet results are sourced
            from Athletic.net, and the app links directly to school athletics resources for forms, policies,
            and official communications.
          </p>
          <div className="about-links-row">
            <a href="https://www.stillwaterchristianschool.org/" target="_blank" rel="noopener noreferrer" className="about-ext-link">SCS Website</a>
            <a href="https://www.stillwaterchristianschool.org/athletics/" target="_blank" rel="noopener noreferrer" className="about-ext-link">Athletics Page</a>
            <a href="https://www.stillwaterchristianschool.org/athletics/athletic-resources/" target="_blank" rel="noopener noreferrer" className="about-ext-link">Resources &amp; Forms</a>
            <a href="https://www.athletic.net/school/StillwaterChristian" target="_blank" rel="noopener noreferrer" className="about-ext-link">Athletic.net</a>
          </div>
        </section>

        <section className="about-section">
          <h2 className="about-heading">Program Leadership</h2>
          <div className="about-staff">
            {STAFF.map(s => (
              <div key={s.name} className="about-staff-row">
                <span className="about-staff-role">{s.role}</span>
                <span className="about-staff-name">{s.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h2 className="about-heading">Our Mission</h2>
          <blockquote className="about-mission">
            Athletics at Stillwater are an extension of the classroom where we pursue our school's mission
            and vision through athletic participation. Sportsmanship, hard work, teamwork, positive attitudes,
            and commitment to improving are exemplified and reinforced in all we do.
          </blockquote>
        </section>

        <section className="about-section about-privacy">
          <h2 className="about-heading">Privacy</h2>
          <p>
            <strong>Student Privacy:</strong> This app is password-protected and not indexed by search engines.
            Athlete information displayed includes names, grades, event participation, and performance data
            consistent with what is publicly available on Athletic.net. Photos are shared only within the
            team community. For questions or concerns about student data, please contact the Athletic Department.
          </p>
        </section>
      </div>

      <div className="about-back">
        <Link to="/" className="about-back-link">&larr; Back to Home</Link>
      </div>
    </div>
  )
}

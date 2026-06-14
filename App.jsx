import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Generator from './pages/Generator'
import Tutorial from './pages/Tutorial'
import Explore from './pages/Explore'
import Auth from './pages/Auth'
import './index.css'

function Nav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  const checkUser = () => {
    const session = localStorage.getItem('kolam_user')
    if (session) {
      setUser(JSON.parse(session))
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    checkUser()
    window.addEventListener('authChange', checkUser)
    return () => {
      window.removeEventListener('authChange', checkUser)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('kolam_user')
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">Kolam AI</Link>
      <div className="nav-links" style={{ alignItems: 'center' }}>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
        <Link to="/analyze" className={`nav-link ${location.pathname === '/analyze' ? 'active' : ''}`}>Analyze Photo</Link>
        <Link to="/generate" className={`nav-link ${location.pathname === '/generate' ? 'active' : ''}`}>Create Custom</Link>
        <Link to="/explore" className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}>Explore</Link>
        
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 600 }}>
              👤 {user.name}
            </span>
            <button 
              className="btn" 
              style={{ margin: 0, padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)' }} 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="btn" 
            style={{ margin: 0, padding: '0.4rem 1.2rem', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyze" element={<Dashboard />} />
        <Route path="/generate" element={<Generator />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Auth />} />
      </Routes>
    </Router>
  )
}

export default App

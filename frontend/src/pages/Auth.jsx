import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields.')
      return
    }

    // Mock authentication
    const userSession = {
      email,
      name: isLogin ? 'Art Explorer' : name,
      loggedInAt: new Date().toISOString()
    }
    
    localStorage.setItem('kolam_user', JSON.stringify(userSession))
    
    // Dispatch custom event to let Navbar listen to state change
    window.dispatchEvent(new Event('authChange'))
    
    navigate('/')
  }

  return (
    <div className="app-container auth-container">
      <div className="glass-panel auth-card">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Your Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}

          <button className="btn" style={{ width: '100%', marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))' }} type="submit">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="app-container">
      <div className="hero-section">
        {/* Floating Decorative SVG Kolam in Background */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '200px',
          opacity: 0.05,
          zIndex: -1,
          animation: 'spin 40s linear infinite'
        }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--primary-color)" strokeWidth="1" />
            <path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" fill="none" stroke="var(--accent-color)" strokeWidth="1" />
            <path d="M 50 10 C 70 30, 70 70, 50 90 C 30 70, 30 30, 50 10" fill="none" stroke="var(--primary-color)" strokeWidth="1" />
            <path d="M 10 50 C 30 70, 70 70, 90 50 C 70 30, 30 30, 10 50" fill="none" stroke="var(--primary-color)" strokeWidth="1" />
          </svg>
        </div>

        <h1 className="hero-title">AI-Powered Kolam & Rangoli Artistry</h1>
        <p className="hero-subtitle">
          Experience the beautiful intersection of traditional Indian floor art and computer vision. 
          Upload patterns for step-by-step interactive drawing tutorials, or create your own custom mathematical layouts.
        </p>
        <div className="hero-ctas">
          <button 
            className="btn" 
            style={{ padding: '1rem 2.2rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))' }} 
            onClick={() => navigate('/analyze')}
          >
            Analyze Image 📷
          </button>
          <button 
            className="btn" 
            style={{ padding: '1rem 2.2rem', fontSize: '1.1rem', background: 'transparent', border: '2px solid rgba(236, 72, 153, 0.6)', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.15)' }} 
            onClick={() => navigate('/generate')}
          >
            Create Custom 🎨
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <h2 className="section-title" style={{ marginTop: 0, textAlign: 'center', borderBottom: 'none' }}>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">✨</span>
            <h3>Centerline Extraction</h3>
            <p>Mathematical contours, skeletonization, and B-spline curves generate smooth, noise-free drawing paths from high-contrast photos.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🧭</span>
            <h3>Interactive Tutorial</h3>
            <p>A step-by-step guide with adjustable playback speeds and auto-play modes designed to teach drawing stroke-by-stroke.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📐</span>
            <h3>Mathematical Creator</h3>
            <p>Generate precise geometric patterns based on custom grid dimensions, symmetry controls, and drawing style parameters.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

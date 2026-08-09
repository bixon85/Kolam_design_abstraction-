import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-active')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-active')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-active')
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const analyzeImage = async () => {
    if (!imageFile) return
    
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('image', imageFile)
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image')
      }
      
      setResult(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Kolam AI Analyzer</h1>
        <p>Advanced Vision Agent for Traditional Floor Art</p>
      </header>

      {!result && !loading && (
        <div className="glass-panel">
          <div 
            className="upload-zone"
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="upload-icon">✨</span>
            <h2>Upload a Kolam or Rangoli</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Drag and drop an image here, or click to browse</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*"
            />
          </div>
          
          {previewUrl && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px', borderRadius: '12px', border: '1px solid var(--glass-border)' }} />
              <div>
                <button className="btn" onClick={analyzeImage}>Analyze Pattern</button>
              </div>
            </div>
          )}
          
          {error && <div style={{ color: 'var(--error)', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}
        </div>
      )}

      {loading && (
        <div className="glass-panel loader-container">
          <div className="spinner"></div>
          <h2>Analyzing Pattern...</h2>
          <p style={{ color: 'var(--text-muted)' }}>Detecting grids, motifs, and symmetry</p>
        </div>
      )}

      {result && !loading && (
        <div className="dashboard-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Analysis Complete</h2>
            <div>
                {result.tutorial_steps && result.tutorial_steps.length > 0 && (
                    <button 
                      className="btn" 
                      style={{ marginRight: '1rem', background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))' }} 
                      onClick={() => navigate('/tutorial', { 
                        state: { 
                          steps: result.tutorial_steps,
                          patternInfo: {
                            pattern_type: result.pattern_type,
                            complexity: result.complexity_level,
                            symmetry: result.symmetry?.type
                          }
                        } 
                      })}
                    >
                      View Tutorial
                    </button>
                )}
                <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', marginTop: 0 }} onClick={() => {setResult(null); setImageFile(null); setPreviewUrl(null)}}>Analyze Another</button>
            </div>
          </div>
          
          <div className="dashboard">
            <div className="glass-panel">
              <img src={previewUrl} alt="Kolam" className="image-preview" />
              
              <div style={{ marginTop: '1.5rem' }}>
                <h3 className="section-title" style={{ marginTop: 0 }}>Explanation</h3>
                <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>{result.explanation}</p>
              </div>

              {result.reconstruction_svg && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 className="section-title">Ideal Reconstruction</h3>
                  <div 
                    style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', display: 'flex', justifyContent: 'center', border: '1px solid var(--glass-border)' }}
                    dangerouslySetInnerHTML={{ __html: result.reconstruction_svg }} 
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>Generated by LangGraph Reconstruction Agent</p>
                </div>
              )}
            </div>
            
            <div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-title">Pattern Type</div>
                  <div className="stat-value">{result.pattern_type}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Confidence</div>
                  <div className="stat-value" style={{ color: result.confidence > 80 ? 'var(--success)' : 'var(--accent-color)'}}>
                    {result.confidence}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Complexity</div>
                  <div className="stat-value">{result.complexity_level}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Symmetry</div>
                  <div className="stat-value" style={{ fontSize: '1.1rem' }}>{result.symmetry?.type} ({result.symmetry?.score}/100)</div>
                </div>
              </div>

              <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                <h3 className="section-title" style={{ marginTop: 0 }}>Quality Scores</h3>
                {result.quality_scores && Object.entries(result.quality_scores).map(([key, value]) => (
                  <div className="progress-container" key={key}>
                    <div className="progress-label">
                      <span style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                      <span>{value}/100</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                <h3 className="section-title" style={{ marginTop: 0 }}>Detected Motifs & Grid</h3>
                {result.dot_grid?.detected && (
                  <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                    Dot Grid detected: <strong>{result.dot_grid.rows} x {result.dot_grid.columns}</strong>
                  </p>
                )}
                <div className="tags">
                  {result.motifs?.map((motif, i) => (
                    <span key={i} className="tag">{motif}</span>
                  ))}
                </div>
              </div>

              <div className="glass-panel">
                <h3 className="section-title" style={{ marginTop: 0, color: 'var(--error)' }}>Issues Detected</h3>
                <ul className="list-items">
                  {result.issues_detected?.length > 0 ? result.issues_detected.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  )) : <li style={{ color: 'var(--success)'}}>No significant issues detected.</li>}
                </ul>

                <h3 className="section-title">Suggestions</h3>
                <ul className="list-items">
                  {result.suggestions?.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Generator() {
  const [gridSize, setGridSize] = useState(5) // 3, 5, 7, 9
  const [styleType, setStyleType] = useState('Padi') // 'Padi', 'Pulli', 'Sikku'
  const [symmetry, setSymmetry] = useState(4) // 4 or 8
  const [complexity, setComplexity] = useState('Medium') // 'Simple', 'Medium', 'Complex'
  const [generatedSteps, setGeneratedSteps] = useState([])
  const [dotsList, setDotsList] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    generatePattern()
  }, [gridSize, styleType, symmetry, complexity])

  const generatePattern = () => {
    const N = parseInt(gridSize)
    const S = 80 / (N - 1) // Spacing between dots
    
    // 1. Generate dots list
    const dots = []
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        dots.push({
          cx: 10 + c * S,
          cy: 10 + r * S
        })
      }
    }
    setDotsList(dots)

    const steps = []
    
    if (styleType === 'Padi') {
      // Concentric Geometric diamonds/squares
      const layersCount = Math.floor(N / 2) + 1
      
      // Step 1: Base Dots & Inner diamond
      const step1Paths = []
      // Inner diamond
      const c = 50
      const offset = S
      if (layersCount > 1) {
        step1Paths.push(`M ${c} ${c - offset} L ${c + offset} ${c} L ${c} ${c + offset} L ${c - offset} ${c} Z`)
      } else {
        step1Paths.push(`M ${c - 5} ${c - 5} L ${c + 5} ${c - 5} L ${c + 5} ${c + 5} L ${c - 5} ${c + 5} Z`)
      }
      
      steps.push({
        step: 1,
        title: "Center Foundation",
        instruction: "Draw the central diamond connecting the core dots surrounding the origin.",
        dots: dots,
        difficulty: "Beginner",
        estimated_time: "1 min",
        stroke_paths: step1Paths
      })

      // Step 2...Layers: Concentric shapes
      for (let l = 1; l < layersCount; l++) {
        const dist = l * S
        const pathSquare = `M ${50 - dist} ${50 - dist} L ${50 + dist} ${50 - dist} L ${50 + dist} ${50 + dist} L ${50 - dist} ${50 + dist} Z`
        
        steps.push({
          step: l + 1,
          title: `Layer ${l} Frame`,
          instruction: `Add the concentric square frame outlining the grid at layer depth ${l}.`,
          difficulty: "Beginner",
          estimated_time: "1 min",
          stroke_paths: [pathSquare]
        })

        // Draw diamond framing if grid allows
        if (50 + dist + S/2 <= 95) {
          const pathDiamond = `M 50 ${50 - dist - S/2} L ${50 + dist + S/2} 50 L 50 ${50 + dist + S/2} L ${50 - dist - S/2} 50 Z`
          steps.push({
            step: l + 2,
            title: `Layer ${l} Diamond`,
            instruction: `Draw the outer diamond framing overlapping the grid bounds.`,
            difficulty: "Medium",
            estimated_time: "1.5 min",
            stroke_paths: [pathDiamond]
          })
        }
      }
    } 
    else if (styleType === 'Pulli') {
      // Floral / Radial Lotus Star
      // Step 1: Base Dots & Inner Circle
      steps.push({
        step: 1,
        title: "Core Foundation",
        instruction: "Generate the base dot grid and draw a central circle path.",
        dots: dots,
        difficulty: "Beginner",
        estimated_time: "1 min",
        stroke_paths: [`M 50 45 A 5 5 0 1 1 50 55 A 5 5 0 1 1 50 45`]
      })

      // Generate Petals dynamically based on symmetry
      const petalsCount = parseInt(symmetry)
      const maxR = 38 // Radius limit
      const angleStep = (2 * Math.PI) / petalsCount

      // Draw petals in opposite pairs to show step sequencing
      for (let i = 0; i < petalsCount / 2; i++) {
        const strokePaths = []
        
        // Petal 1
        const theta1 = i * angleStep
        const tipX1 = 50 + maxR * Math.cos(theta1)
        const tipY1 = 50 + maxR * Math.sin(theta1)
        const c1X_a = 50 + (maxR / 1.8) * Math.cos(theta1 - 0.25)
        const c1Y_a = 50 + (maxR / 1.8) * Math.sin(theta1 - 0.25)
        const c1X_b = 50 + (maxR / 1.8) * Math.cos(theta1 + 0.25)
        const c1Y_b = 50 + (maxR / 1.8) * Math.sin(theta1 + 0.25)
        
        strokePaths.push(`M 50 50 C ${c1X_a} ${c1Y_a}, ${tipX1} ${tipY1}, ${tipX1} ${tipY1} C ${tipX1} ${tipY1}, ${c1X_b} ${c1Y_b}, 50 50 Z`)

        // Opposite Petal
        const theta2 = theta1 + Math.PI
        const tipX2 = 50 + maxR * Math.cos(theta2)
        const tipY2 = 50 + maxR * Math.sin(theta2)
        const c2X_a = 50 + (maxR / 1.8) * Math.cos(theta2 - 0.25)
        const c2Y_a = 50 + (maxR / 1.8) * Math.sin(theta2 - 0.25)
        const c2X_b = 50 + (maxR / 1.8) * Math.cos(theta2 + 0.25)
        const c2Y_b = 50 + (maxR / 1.8) * Math.sin(theta2 + 0.25)
        
        strokePaths.push(`M 50 50 C ${c2X_a} ${c2Y_a}, ${tipX2} ${tipY2}, ${tipX2} ${tipY2} C ${tipX2} ${tipY2}, ${c2X_b} ${c2Y_b}, 50 50 Z`)

        steps.push({
          step: i + 2,
          title: `Symmetric Petals ${i + 1}`,
          instruction: `Draw symmetric lotus petals along the diagonal radial axis at ${Math.round(theta1 * 180 / Math.PI)}° and ${Math.round(theta2 * 180 / Math.PI)}°.`,
          difficulty: "Medium",
          estimated_time: "1.5 min",
          stroke_paths: strokePaths
        })
      }

      // Add a border overlay at the end
      steps.push({
        step: steps.length + 1,
        title: "Outer Border Glow",
        instruction: "Draw an elegant ring connecting all the outer tips of the petals.",
        difficulty: "Medium",
        estimated_time: "1 min",
        stroke_paths: [`M 50 ${50 - maxR} A ${maxR} ${maxR} 0 1 1 50 ${50 + maxR} A ${maxR} ${maxR} 0 1 1 50 ${50 - maxR}`]
      })
    } 
    else {
      // Sikku Weaving Waves
      steps.push({
        step: 1,
        title: "Dot Matrix Setup",
        instruction: "Prepare the dot matrix and draw the core bounding ring.",
        dots: dots,
        difficulty: "Beginner",
        estimated_time: "1 min",
        stroke_paths: [`M 50 20 A 30 30 0 1 1 50 80 A 30 30 0 1 1 50 20`]
      })

      // Generate waves weaving through dots
      const verticalPaths = []
      const horizontalPaths = []

      // Create vertical waves
      for (let col = 1; col < N; col += 2) {
        const x = 10 + col * S - S/2
        // Weaving path up and down
        let path = `M ${x} 10 `
        for (let row = 0; row < N; row++) {
          const y = 10 + row * S
          const xOffset = (row % 2 === 0 ? S/3 : -S/3)
          path += `Q ${x + xOffset} ${y + S/2} ${x} ${y + S} `
        }
        verticalPaths.push(path)
      }

      // Create horizontal waves
      for (let row = 1; row < N; row += 2) {
        const y = 10 + row * S - S/2
        let path = `M 10 ${y} `
        for (let col = 0; col < N; col++) {
          const x = 10 + col * S
          const yOffset = (col % 2 === 0 ? S/3 : -S/3)
          path += `Q ${x + S/2} ${y + yOffset} ${x + S} ${y} `
        }
        horizontalPaths.push(path)
      }

      steps.push({
        step: 2,
        title: "Vertical Waves Weave",
        instruction: "Trace the vertical weaving splines looping sequentially between dot rows.",
        difficulty: "Advanced",
        estimated_time: "2 mins",
        stroke_paths: verticalPaths
      })

      steps.push({
        step: 3,
        title: "Horizontal Waves Intersect",
        instruction: "Intersect the pattern with horizontal weaving splines looping between dot columns.",
        difficulty: "Advanced",
        estimated_time: "2 mins",
        stroke_paths: horizontalPaths
      })
    }

    setGeneratedSteps(steps)
  }

  return (
    <div className="app-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1>Custom Kolam Generator</h1>
        <p>Design mathematically perfect geometric art</p>
      </header>

      <div className="generator-layout">
        {/* Left Side: Parameters Form */}
        <div className="glass-panel generator-controls">
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Parameters</h2>
          
          <div className="control-group">
            <label className="control-label">Grid Dimensions</label>
            <select 
              className="control-select" 
              value={gridSize} 
              onChange={(e) => setGridSize(parseInt(e.target.value))}
            >
              <option value="3">3 x 3 Matrix</option>
              <option value="5">5 x 5 Matrix</option>
              <option value="7">7 x 7 Matrix</option>
              <option value="9">9 x 9 Matrix</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Kolam Style</label>
            <select 
              className="control-select" 
              value={styleType} 
              onChange={(e) => setStyleType(e.target.value)}
            >
              <option value="Padi">Padi (Geometric Concentric Squares)</option>
              <option value="Pulli">Pulli (Symmetric Floral Star)</option>
              <option value="Sikku">Sikku (Interwoven Wave Loops)</option>
            </select>
          </div>

          {styleType === 'Pulli' && (
            <div className="control-group">
              <label className="control-label">Symmetry Order</label>
              <select 
                className="control-select" 
                value={symmetry} 
                onChange={(e) => setSymmetry(parseInt(e.target.value))}
              >
                <option value="4">4-Fold Radial</option>
                <option value="8">8-Fold Radial</option>
              </select>
            </div>
          )}

          <div className="control-group">
            <label className="control-label">Complexity Factor</label>
            <select 
              className="control-select" 
              value={complexity} 
              onChange={(e) => setComplexity(e.target.value)}
            >
              <option value="Simple">Simple Baseline</option>
              <option value="Medium">Standard Flow</option>
              <option value="Complex">Dense Details</option>
            </select>
          </div>

          <button 
            className="btn" 
            style={{ width: '100%', marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' }} 
            onClick={() => navigate('/tutorial', { 
              state: { 
                steps: generatedSteps,
                patternInfo: {
                  pattern_type: `${styleType} Kolam`,
                  complexity: complexity,
                  symmetry: styleType === 'Pulli' ? `${symmetry}-Fold Radial` : 'None'
                }
              } 
            })}
          >
            Launch Step-by-Step Tutorial 🚀
          </button>
        </div>

        {/* Right Side: Math Preview Canvas */}
        <div className="generator-preview glass-panel">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>Pattern Preview</h2>
          <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ maxWidth: '420px' }}>
            {/* Draw Dot Grid */}
            {dotsList.map((dot, i) => (
              <circle key={`prev-dot-${i}`} cx={dot.cx} cy={dot.cy} r="1.2" fill="var(--text-muted)" />
            ))}
            
            {/* Draw Composite Path preview */}
            {generatedSteps.map((step) => 
              step.stroke_paths?.map((path, idx) => (
                <path 
                  key={`prev-path-${step.step}-${idx}`} 
                  d={path} 
                  fill="none" 
                  stroke="var(--primary-color)" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ filter: 'drop-shadow(0 0 3px rgba(6, 182, 212, 0.4))' }}
                />
              ))
            )}
          </svg>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            {generatedSteps.length} distinct sequence steps generated mathematically.
          </span>
        </div>
      </div>
    </div>
  )
}

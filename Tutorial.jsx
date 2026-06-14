import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Tutorial() {
  const location = useLocation()
  const navigate = useNavigate()
  const steps = location.state?.steps || []
  const patternInfo = location.state?.patternInfo || {}
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'guru', text: "Namaste! I am your Kolam Guru. 🌸 I can help you understand the history, symmetry, or geometry of this design. Feel free to ask me any questions or click a suggestion below!" }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const svgRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        })
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kolam-step-${currentStep + 1}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (steps.length === 0) {
    return (
      <div className="app-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2>No tutorial data found.</h2>
        <button className="btn" onClick={() => navigate('/')}>Return Home</button>
      </div>
    )
  }

  // Get dots from step 1 (or any step that defines them)
  const dots = steps.find(s => s.dots)?.dots || []
  const activeStepData = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1)
  }

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  const handleSendMessage = async (msgText) => {
    const query = msgText || chatInput
    if (!query.trim()) return
    
    // Append user message
    setChatMessages(prev => [...prev, { sender: 'user', text: query }])
    if (!msgText) setChatInput('')
    setIsGenerating(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: chatMessages.slice(1),
          context: {
            pattern_type: patternInfo.pattern_type || "Traditional Kolam",
            total_steps: steps.length,
            current_step: currentStep + 1,
            step_title: activeStepData?.title || "",
            step_instruction: activeStepData?.instruction || ""
          }
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to contact Guru")
      }
      
      setChatMessages(prev => [...prev, { sender: 'guru', text: data.reply }])
    } catch (err) {
      console.error("Guru Chat Error:", err)
      setChatMessages(prev => [...prev, { sender: 'guru', text: `Forgive me, my connection is failing: ${err.message}. Please verify the API key is configured.` }])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="app-container">
      <header className="header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Interactive Tutorial</h1>
        <p>Step-by-step drawing sequence with AI Advisor</p>
      </header>

      <div className="tutorial-layout">
        {/* Left Panel: Instructions */}
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Step {currentStep + 1} of {steps.length}</span>
            <span style={{ fontSize: '0.8rem', background: 'rgba(245,158,11,0.1)', color: 'var(--accent-color)', padding: '4px 10px', borderRadius: '12px' }}>
              {activeStepData.difficulty} ({activeStepData.estimated_time})
            </span>
          </div>
          
          <h2 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>{activeStepData.title}</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{activeStepData.instruction}</p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={handlePrev} disabled={currentStep === 0}>Previous</button>
            <button className="btn" style={{ flex: 1 }} onClick={handleNext} disabled={currentStep === steps.length - 1}>Next Step</button>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <button className="btn" style={{ width: '100%', background: isPlaying ? 'var(--accent-color)' : 'var(--primary-color)' }} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'Pause Auto-Play ⏸️' : 'Start Auto-Play ▶️'}
            </button>
          </div>
          
          <button className="btn" style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
        </div>

        {/* Center Panel: SVG Canvas */}
        <div className="canvas-container">
          <button 
            className="btn" 
            style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem 1.8rem', fontSize: '0.85rem', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', marginTop: 0 }}
            onClick={downloadSVG}
          >
            Download SVG 📥
          </button>
          <svg ref={svgRef} viewBox="0 0 100 100" width="100%" height="100%" style={{ maxWidth: '500px' }}>
            {/* 1. Draw Dots (only if we are on or past step 1) */}
            {dots.map((dot, i) => (
              <circle key={`dot-${i}`} cx={dot.cx} cy={dot.cy} r="1.5" fill="var(--text-muted)" />
            ))}
            
            {/* 2. Draw all paths up to current step */}
            {steps.slice(0, currentStep + 1).map((step, stepIndex) => (
              step.stroke_paths?.map((pathData, pathIndex) => {
                const isCurrentStep = stepIndex === currentStep;
                return (
                  <path 
                    key={`path-${stepIndex}-${pathIndex}`} 
                    d={pathData} 
                    fill="none" 
                    stroke={isCurrentStep ? "var(--primary-color)" : "var(--accent-color)"} 
                    strokeOpacity={isCurrentStep ? "1" : "0.4"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isCurrentStep ? "animated-path" : ""}
                  />
                )
              })
            ))}
          </svg>
        </div>

        {/* Right Panel: AI Guru Chat Sidebar */}
        <div className="glass-panel chat-sidebar">
          <div className="chat-header">
            <h3>🤖 Kolam Guru</h3>
            <span className="chat-subtitle">Drawing & Mathematics Advisor</span>
          </div>

          <div className="chat-messages-container">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.sender}`}>
                <div className="message-bubble">{msg.text}</div>
              </div>
            ))}
            {isGenerating && (
              <div className="chat-message guru">
                <div className="message-bubble loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-suggestions">
            <button className="chat-suggest-btn" disabled={isGenerating} onClick={() => handleSendMessage("What does this pattern signify?")}>
              ✨ Signify?
            </button>
            <button className="chat-suggest-btn" disabled={isGenerating} onClick={() => handleSendMessage("Any drawing tips for this step?")}>
              💡 Step Tips?
            </button>
            <button className="chat-suggest-btn" disabled={isGenerating} onClick={() => handleSendMessage("What is the mathematical symmetry here?")}>
              📐 Symmetry?
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="chat-input-form">
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Kolam Guru..."
              className="chat-input"
              disabled={isGenerating}
            />
            <button type="submit" className="chat-send-btn" disabled={isGenerating || !chatInput.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'

export default function Explore() {
  const navigate = useNavigate()

  // Sample hardcoded data for the explore page
  const sampleKolams = [
    {
      id: 1,
      title: "Lotus Pond Star",
      type: "Sikku Kolam",
      difficulty: "Medium",
      dots: "5x5",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Kolam_pattern.svg/800px-Kolam_pattern.svg.png",
      tags: ["Floral", "Symmetry"]
    },
    {
      id: 2,
      title: "Infinite Knot",
      type: "Padi Kolam",
      difficulty: "Advanced",
      dots: "7x7",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rangoli.jpg/800px-Rangoli.jpg",
      tags: ["Geometric", "Complex"]
    },
    {
      id: 3,
      title: "Simple Diya",
      type: "Pulli Kolam",
      difficulty: "Beginner",
      dots: "3x3",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Rangoli_patterns.jpg/800px-Rangoli_patterns.jpg",
      tags: ["Beginner", "Festival"]
    }
  ]

  return (
    <div className="app-container">
      <header className="header">
        <h1>Explore Patterns</h1>
        <p>Discover beautiful traditional Kolam designs</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {sampleKolams.map((kolam) => (
          <div key={kolam.id} className="glass-panel explore-card">
            <div className="explore-card-img-container">
                <img src={kolam.image} alt={kolam.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{kolam.title}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <span>{kolam.type}</span>
              <span>Dots: {kolam.dots}</span>
            </div>
            
            <div className="tags" style={{ marginBottom: '1.5rem' }}>
              <span className="tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>{kolam.difficulty}</span>
              {kolam.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button className="btn" style={{ width: '100%' }} onClick={() => navigate('/')}>Analyze Similar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

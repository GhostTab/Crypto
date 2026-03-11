import React from 'react'
import '../Home/Home.css'
import './ChooseUs.css'

const ChooseUs = () => {
  const points = [
    {
      title: 'Secure & Transparent',
      description: 'We use industry-leading security so your assets and data stay protected.',
    },
    {
      title: 'Real-Time Data',
      description: 'Live prices and market data from trusted sources, updated around the clock.',
    },
    {
      title: 'Simple & Clear',
      description: 'No jargon—track what matters with a clean, easy-to-use interface.',
    },
  ]

  return (
    <div className="home">
      <div className="hero">
        <h1>Why Choose Us</h1>
        <p>Your trusted place to explore and track the world of digital currency.</p>
      </div>
      <section className="choose-us-section">
        <div className="choose-us-grid">
          {points.map((item, index) => (
            <div className="choose-us-card" key={index}>
              <span className="choose-us-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ChooseUs

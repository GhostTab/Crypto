import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../Home/Home.css'
import './Join.css'

const Join = () => {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="home">
      <div className="hero">
        <h1>Join the Community</h1>
        <p>Create an account to save your favorites, set alerts, and get the most out of the platform.</p>
      </div>
      <section className="join-section">
        <div className="join-card">
          <h2>Get started in seconds</h2>
          <p>Sign up with email or connect your wallet. No credit card required.</p>
          <div className="join-actions">
            <Link to="/auth" className="join-btn primary">Sign up</Link>
            <Link to="/auth" className="join-btn secondary">Log in</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Join

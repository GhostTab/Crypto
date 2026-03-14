import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../Home/Home.css'
import './Auth.css'

const Auth = () => {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    remember: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setError('')
    setSuccess('')
  }

  function getFriendlyAuthError(msg) {
    if (!msg) return 'Something went wrong. Please try again.'
    const m = msg.toLowerCase()
    if (m.includes('invalid login') || m.includes('invalid credentials')) return 'Wrong email or password. Please try again.'
    if (m.includes('email not confirmed')) return 'Please confirm your email using the link we sent you, then sign in.'
    if (m.includes('already registered') || m.includes('already exists')) return 'An account with this email already exists. Try signing in.'
    if (m.includes('password')) return 'Password must be at least 6 characters.'
    return msg
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (mode === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'signin') {
        const { data, error: err } = await signIn(form.email, form.password)
        if (err) {
          setError(getFriendlyAuthError(err.message))
          return
        }
        if (data?.user) {
          navigate('/')
          return
        }
      } else {
        const { data, error: err } = await signUp(form.email, form.password, {
          full_name: form.name || undefined,
        })
        if (err) {
          setError(getFriendlyAuthError(err.message))
          return
        }
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists. Try signing in.')
          return
        }
        setSuccess('Account created. Check your email to confirm, or sign in now.')
        setMode('signin')
        setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign up
          </button>
        </div>

        <h1 className="auth-title">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'signin'
            ? 'Sign in to track your portfolio and alerts.'
            : 'Join to save favorites and get price alerts.'}
        </p>

        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
            />
          </div>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          )}
          {mode === 'signin' && (
            <div className="auth-row">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <Link to="#" className="auth-link">
                Forgot password?
              </Link>
            </div>
          )}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>
        <div className="auth-social">
          <button type="button" className="auth-social-btn" disabled>
            Google (coming soon)
          </button>
          <button type="button" className="auth-social-btn" disabled>
            GitHub (coming soon)
          </button>
        </div>

        <p className="auth-footer">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="auth-switch" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="auth-switch" onClick={() => setMode('signin')}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default Auth

import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CoinContext } from '../../context/CoinContext'
import { supabase } from '../../lib/supabase'
import '../Home/Home.css'
import './Alerts.css'

const Alerts = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currency, allCoin } = useContext(CoinContext)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const coinOptions = (allCoin || []).slice(0, 150)
  const defaultCoinId = coinOptions[0]?.id || 'bitcoin'
  const [form, setForm] = useState({ coin_id: defaultCoinId, condition: 'above', target_price: '', currency: currency?.name || 'usd' })
  const [submitError, setSubmitError] = useState('')
  const [confirmMessage, setConfirmMessage] = useState('')

  useEffect(() => {
    setForm((f) => ({ ...f, currency: currency?.name || 'usd' }))
  }, [currency?.name])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setAlerts(data || [])
      setLoading(false)
    }
    fetchAlerts()
  }, [user?.id])

  function getFriendlyAlertError(msg) {
    if (!msg) return 'Could not add alert. Please try again.'
    const m = msg.toLowerCase()
    if (m.includes('foreign key') || m.includes('user')) return 'Session expired. Please sign in again.'
    if (m.includes('duplicate') || m.includes('unique')) return 'You already have an alert for this coin and price.'
    return msg
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setConfirmMessage('')
    const price = parseFloat(form.target_price)
    if (!price || price <= 0) {
      setSubmitError('Enter a valid target price (e.g. 50000).')
      return
    }
    if (!user) return
    const coinId = (form.coin_id || '').trim().toLowerCase()
    const coin = coinOptions.find((c) => (c.id || '').toLowerCase() === coinId)
    if (!coinId || !coin) {
      setSubmitError('Please choose a coin from the list so we can notify you correctly.')
      return
    }
    const { error } = await supabase.from('price_alerts').insert({
      user_id: user.id,
      coin_id: coinId,
      condition: form.condition,
      target_price: price,
      currency: form.currency,
    })
    if (error) {
      setSubmitError(getFriendlyAlertError(error.message))
      return
    }
    setAlerts((prev) => [
      {
        id: crypto.randomUUID(),
        coin_id: coinId,
        condition: form.condition,
        target_price: price,
        currency: form.currency,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ])
    setForm((f) => ({ ...f, target_price: '' }))
    const coinLabel = coin ? `${coin.name} (${coin.symbol?.toUpperCase()})` : coinId
    setConfirmMessage(`We'll notify you when ${coinLabel} goes ${form.condition === 'above' ? 'above' : 'below'} ${sym}${price.toLocaleString()}.`)
    setTimeout(() => setConfirmMessage(''), 6000)
  }

  const removeAlert = async (id) => {
    if (!user) return
    await supabase.from('price_alerts').delete().eq('id', id).eq('user_id', user.id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const sym = currency?.symbol || '$'

  if (!user) {
    return (
      <div className="alerts-page">
        <div className="alerts-card">
          <h1>Price Alerts</h1>
          <p>Sign in to create price alerts.</p>
          <button type="button" className="alerts-cta" onClick={() => navigate('/auth')}>
            Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="alerts-page">
      <div className="alerts-hero">
        <h1>Price Alerts</h1>
        <p>Get notified when a coin goes above or below your target price.</p>
      </div>

      <form onSubmit={handleAdd} className="alerts-form">
        <div className="alerts-form-row">
          <div className="alerts-field">
            <label htmlFor="coin_id">Coin</label>
            <select
              id="coin_id"
              value={coinOptions.some((c) => c.id === form.coin_id) ? form.coin_id : defaultCoinId}
              onChange={(e) => setForm((f) => ({ ...f, coin_id: e.target.value }))}
              required
            >
              {coinOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol?.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <div className="alerts-field">
            <label htmlFor="condition">Condition</label>
            <select
              id="condition"
              value={form.condition}
              onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
            >
              <option value="above">Price above</option>
              <option value="below">Price below</option>
            </select>
          </div>
          <div className="alerts-field">
            <label htmlFor="target_price">Target price ({form.currency.toUpperCase()})</label>
            <input
              id="target_price"
              type="number"
              step="any"
              min="0"
              placeholder="0"
              value={form.target_price}
              onChange={(e) => setForm((f) => ({ ...f, target_price: e.target.value }))}
            />
          </div>
          <button type="submit" className="alerts-submit">Add alert</button>
        </div>
        <p className="alerts-form-note">We only support coins from the market list so we can match prices and notify you correctly.</p>
        {submitError && <p className="alerts-error">{submitError}</p>}
        {confirmMessage && <p className="alerts-confirm" role="status">{confirmMessage}</p>}
      </form>

      <div className="alerts-list">
        <h2>Your alerts</h2>
        {loading ? (
          <p className="alerts-loading">Loading...</p>
        ) : alerts.length === 0 ? (
          <div className="alerts-empty-state">
            <p className="alerts-empty">No alerts yet. Create one above to get notified when prices hit your target.</p>
            <button type="button" className="alerts-empty-cta" onClick={() => document.getElementById('coin_id')?.focus()}>
              Create your first alert
            </button>
          </div>
        ) : (
          <ul>
            {alerts.map((a) => {
              const coin = (allCoin || []).find((c) => (c.id || '').toLowerCase() === (a.coin_id || '').toLowerCase())
              const coinLabel = coin ? `${coin.name} (${coin.symbol?.toUpperCase()})` : a.coin_id
              return (
              <li key={a.id} className="alerts-item">
                <span className="alerts-item-coin">{coinLabel}</span>
                <span className="alerts-item-condition">
                  Notify when {a.condition} {sym}{Number(a.target_price).toLocaleString()}
                </span>
                <span className="alerts-item-meta">
                  {a.is_active ? 'Active' : 'Triggered'} · {new Date(a.created_at).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  className="alerts-item-remove"
                  onClick={() => removeAlert(a.id)}
                  aria-label="Remove alert"
                >
                  Remove
                </button>
              </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Alerts

import React, { useState, useContext, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './Navbar.css'
import logo from '../../assets/Platinum.png'
import { CoinContext } from '../../context/CoinContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const Navbar = () => {
  const navigate = useNavigate()
  const { user, profile, signOut, updateProfile } = useAuth()
  const { currency, setCurrency } = useContext(CoinContext)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotif, setShowNotif] = useState(false)

  const currencyHandler = (event) => {
    const value = event.target.value
    const map = { usd: { name: 'usd', symbol: '$' }, eur: { name: 'eur', symbol: '€' }, php: { name: 'php', symbol: '₱' } }
    const next = map[value] || map.usd
    setCurrency(next)
    if (user) updateProfile({ currency: value })
  }

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, body, read_at, created_at, data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifications(data || [])
      setUnreadCount((data || []).filter((n) => !n.read_at).length)
    }
    fetchNotifs()
    const sub = supabase
      .channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, fetchNotifs)
      .subscribe()
    return () => sub.unsubscribe()
  }, [user?.id])

  const markNotificationRead = async (id) => {
    if (!user) return
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/market', label: 'Market' },
    { to: '/choose-us', label: 'Choose Us' },
    { to: '/join', label: 'Join' },
  ]
  if (user) {
    navLinks.push({ to: '/watchlist', label: 'Watchlist' })
    navLinks.push({ to: '/alerts', label: 'Alerts' })
  }

  const currentCurrency = currency?.name || profile?.currency || 'usd'

  return (
    <div className="head">
      <NavLink to="/" className="logo-link">
        <img src={logo} className="logo" alt="Platinum" />
      </NavLink>
      <nav className="Navbar">
        <ul>
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                end={to === '/'}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="nav-right">
        <select value={currentCurrency} onChange={currencyHandler}>
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="php">PHP</option>
        </select>

        {user ? (
          <>
            <div className="nav-notif-wrap">
              <button
                type="button"
                className="nav-icon-btn"
                onClick={() => { setShowNotif(!showNotif); setShowUserMenu(false) }}
                aria-label="Notifications"
              >
                <span className="nav-notif-dot" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                </span>
                {unreadCount > 0 && <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {showNotif && (
                <div className="nav-dropdown nav-notif-dropdown">
                  <p className="nav-dropdown-title">Notifications</p>
                  {notifications.length === 0 ? (
                    <p className="nav-dropdown-empty">No notifications yet.</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <button
                        type="button"
                        key={n.id}
                        className={`nav-notif-item ${n.read_at ? '' : 'unread'}`}
                        onClick={() => { markNotificationRead(n.id); if (n.data?.coin_id) navigate(`/coin/${n.data.coin_id}`); setShowNotif(false) }}
                      >
                        <strong>{n.title}</strong>
                        {n.body && <span>{n.body}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="nav-user-wrap">
              <button
                type="button"
                className="nav-user-btn"
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotif(false) }}
              >
                {profile?.display_name || user.email?.split('@')[0] || 'Account'}
              </button>
              {showUserMenu && (
                <div className="nav-dropdown">
                  <p className="nav-dropdown-email">{user.email}</p>
                  <button type="button" className="nav-dropdown-item" onClick={() => { navigate('/watchlist'); setShowUserMenu(false) }}>
                    Watchlist
                  </button>
                  <button type="button" className="nav-dropdown-item" onClick={() => { navigate('/alerts'); setShowUserMenu(false) }}>
                    Price alerts
                  </button>
                  <button
                    type="button"
                    className="nav-dropdown-item"
                    onClick={() => { signOut(); setShowUserMenu(false); navigate('/') }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button type="button" onClick={() => navigate('/auth')}>
            Sign in
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar

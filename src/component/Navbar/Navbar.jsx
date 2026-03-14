import React, { useState, useContext, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import './Navbar.css'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <NavLink to="/" className="logo-link" onClick={() => setMobileMenuOpen(false)}>
        <span className="logo" aria-hidden="true">
          <svg className="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M16 8v16M10 12h12M10 20h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="logo-text">Platinum</span>
      </NavLink>
      <button
        type="button"
        className="nav-mobile-toggle"
        onClick={() => setMobileMenuOpen((o) => !o)}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
      >
        <span className="nav-mobile-toggle-bar" />
        <span className="nav-mobile-toggle-bar" />
        <span className="nav-mobile-toggle-bar" />
      </button>
      <nav className={`Navbar ${mobileMenuOpen ? 'Navbar-open' : ''}`}>
        {user && (
          <div className="nav-mobile-profile">
            <p className="nav-mobile-profile-name">{profile?.display_name || user.email?.split('@')[0] || 'Account'}</p>
            <p className="nav-mobile-profile-email">{user.email}</p>
          </div>
        )}
        <div className="nav-mobile-extra">
          <label className="nav-mobile-currency-wrap">
            <span className="nav-mobile-currency-label">Currency</span>
            <select value={currentCurrency} onChange={currencyHandler} className="nav-mobile-currency-select">
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="php">PHP</option>
            </select>
          </label>
          {user && (
            <div className="nav-mobile-notif-wrap">
              <button
                type="button"
                className="nav-mobile-notif-btn"
                onClick={() => setShowNotif(!showNotif)}
                aria-expanded={showNotif}
              >
                <span className="nav-mobile-notif-icon" aria-hidden>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                </span>
                Notifications
                {unreadCount > 0 && <span className="nav-mobile-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {showNotif && (
                <div className="nav-mobile-notif-list">
                  {notifications.length === 0 ? (
                    <p className="nav-dropdown-empty">No notifications yet.</p>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <button
                        type="button"
                        key={n.id}
                        className={`nav-notif-item ${n.read_at ? '' : 'unread'}`}
                        onClick={() => { markNotificationRead(n.id); if (n.data?.coin_id) navigate(`/coin/${n.data.coin_id}`); setShowNotif(false); setMobileMenuOpen(false) }}
                      >
                        <strong>{n.title}</strong>
                        {n.body && <span>{n.body}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <ul>
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                end={to === '/'}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        {user && (
          <div className="nav-mobile-footer">
            <button type="button" className="nav-mobile-signout" onClick={() => { signOut(); setMobileMenuOpen(false); navigate('/') }}>
              Sign out
            </button>
          </div>
        )}
        {!user && (
          <div className="nav-mobile-footer">
            <button type="button" className="nav-mobile-signin" onClick={() => { navigate('/auth'); setMobileMenuOpen(false) }}>
              Sign in
            </button>
          </div>
        )}
      </nav>
      <div className="nav-right nav-right-desktop">
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
                aria-label="Account menu"
              >
                <span className="nav-user-btn-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <span className="nav-user-btn-text">{profile?.display_name || user.email?.split('@')[0] || 'Account'}</span>
              </button>
              {showUserMenu && (
                <div className="nav-dropdown">
                  <p className="nav-dropdown-email">{user.email}</p>
                  <button type="button" className="nav-dropdown-item" onClick={() => { navigate('/watchlist'); setShowUserMenu(false); setMobileMenuOpen(false) }}>
                    Watchlist
                  </button>
                  <button type="button" className="nav-dropdown-item" onClick={() => { navigate('/alerts'); setShowUserMenu(false); setMobileMenuOpen(false) }}>
                    Price alerts
                  </button>
                  <button
                    type="button"
                    className="nav-dropdown-item"
                    onClick={() => { signOut(); setShowUserMenu(false); setMobileMenuOpen(false); navigate('/') }}
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

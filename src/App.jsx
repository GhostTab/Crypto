import React, { useEffect, useState } from 'react'
import Navbar from './component/Navbar/Navbar'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import Home from './pages/Home/Home'
import Market from './pages/Market/Market'
import ChooseUs from './pages/ChooseUs/ChooseUs'
import Join from './pages/Join/Join'
import Auth from './pages/Auth/Auth'
import Coin from './pages/Coin/Coin'
import Watchlist from './pages/Watchlist/Watchlist'
import Alerts from './pages/Alerts/Alerts'
import { useAuth } from './context/AuthContext'
import { CoinContext } from './context/CoinContext'

const CURRENCY_MAP = {
  usd: { name: 'usd', symbol: '$' },
  eur: { name: 'eur', symbol: '€' },
  php: { name: 'php', symbol: '₱' },
}

const REENGAGEMENT_DAYS = 3
const LAST_VISIT_KEY = 'crypto_app_last_visit'
const REENGAGEMENT_DISMISSED_KEY = 'crypto_app_reengagement_dismissed'

const AppRoutes = () => {
  const location = useLocation()
  const { profile, user } = useAuth()
  const coinContext = React.useContext(CoinContext)
  const [showReengagement, setShowReengagement] = useState(false)

  useEffect(() => {
    if (profile?.currency && coinContext?.setCurrency && CURRENCY_MAP[profile.currency]) {
      coinContext.setCurrency(CURRENCY_MAP[profile.currency])
    }
  }, [profile?.currency])

  useEffect(() => {
    if (typeof window === 'undefined' || !user) return
    const dismissed = localStorage.getItem(REENGAGEMENT_DISMISSED_KEY)
    if (dismissed) return
    const last = localStorage.getItem(LAST_VISIT_KEY)
    const now = Date.now()
    localStorage.setItem(LAST_VISIT_KEY, String(now))
    if (last) {
      const days = (now - Number(last)) / (1000 * 60 * 60 * 24)
      if (days >= REENGAGEMENT_DAYS) setShowReengagement(true)
    }
  }, [user])

  const dismissReengagement = () => {
    setShowReengagement(false)
    localStorage.setItem(REENGAGEMENT_DISMISSED_KEY, '1')
  }

  return (
    <main key={location.pathname} className="page-transition">
      {showReengagement && (
        <div className="app-reengagement" role="banner">
          <p>Welcome back! Your watchlist may have moved — <Link to="/watchlist" className="app-reengagement-link">check it out</Link>.</p>
          <button type="button" className="app-reengagement-dismiss" onClick={dismissReengagement} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/market" element={<Market />} />
        <Route path="/choose-us" element={<ChooseUs />} />
        <Route path="/join" element={<Join />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/coin/:coinId" element={<Coin />} />
      </Routes>
      <footer className="app-footer">
        <span>Data via CoinGecko</span>
      </footer>
    </main>
  )
}

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <AppRoutes />
    </div>
  )
}

export default App

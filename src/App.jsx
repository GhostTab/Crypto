import React, { useEffect } from 'react'
import Navbar from './component/Navbar/Navbar'
import { Routes, Route, useLocation } from 'react-router-dom'
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

const AppRoutes = () => {
  const location = useLocation()
  const { profile } = useAuth()
  const coinContext = React.useContext(CoinContext)

  useEffect(() => {
    if (profile?.currency && coinContext?.setCurrency && CURRENCY_MAP[profile.currency]) {
      coinContext.setCurrency(CURRENCY_MAP[profile.currency])
    }
  }, [profile?.currency])

  return (
    <main key={location.pathname} className="page-transition">
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

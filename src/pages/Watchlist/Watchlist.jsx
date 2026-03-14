import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CoinContext } from '../../context/CoinContext'
import '../Home/Home.css'
import './Watchlist.css'

const Watchlist = () => {
  const navigate = useNavigate()
  const { user, watchlistIds, removeFromWatchlist: removeFromWatchlistCtx, fetchWatchlist } = useAuth()
  const { allCoin, currency } = useContext(CoinContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    let cancelled = false
    const run = async () => {
      try {
        await fetchWatchlist()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [user?.id])

  const removeFromWatchlist = async (e, coinId) => {
    e.stopPropagation()
    if (!user) return
    await removeFromWatchlistCtx(coinId)
  }

  const watchlistIdsNormalized = watchlistIds || []
  const watchlistCoins = watchlistIdsNormalized
    .map((id) => allCoin.find((c) => c.id === id || (c.id && c.id.toLowerCase() === id)))
    .filter(Boolean)

  if (!user) {
    return (
      <div className="watchlist-page">
        <div className="watchlist-card">
          <h1>Watchlist</h1>
          <p>Sign in to save coins to your watchlist.</p>
          <button type="button" className="watchlist-cta" onClick={() => navigate('/auth')}>
            Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="watchlist-page">
      <div className="watchlist-hero">
        <h1>Your Watchlist</h1>
        <p>Coins you’ve saved. Click a row to open details; remove with the star.</p>
      </div>
      <div className="crypto-table watchlist-table">
        <div className="table-layout">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p style={{ textAlign: 'center' }}>24H Change</p>
          <p className="market-cap">Market Cap</p>
          <p></p>
        </div>
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="table-layouts table-skeleton" aria-hidden="true">
                <span className="skeleton" />
                <span className="skeleton" />
                <span className="skeleton" />
                <span className="skeleton" />
                <span className="skeleton" />
                <span className="skeleton" />
              </div>
            ))}
          </>
        ) : watchlistCoins.length === 0 ? (
          <div className="table-layouts watchlist-empty-state">
            <p>No coins in your watchlist yet.</p>
            <Link to="/market" className="watchlist-empty-cta">Add your first coin</Link>
          </div>
        ) : (
          watchlistCoins.map((item) => (
            <div
              className="table-layouts"
              key={item.id}
              onClick={() => navigate(`/coin/${item.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/coin/${item.id}`)}
            >
              <p>{item.market_cap_rank}</p>
              <div>
                <img src={item.image} alt="" />
                <p>{item.name} – {item.symbol}</p>
              </div>
              <p>{currency.symbol} {item.current_price?.toLocaleString()}</p>
              <p className={item.price_change_percentage_24h > 0 ? 'green' : 'red'}>
                {item.price_change_percentage_24h != null ? (Math.floor(item.price_change_percentage_24h * 100) / 100) + '%' : '—'}
              </p>
              <p className="market-cap">{currency.symbol}{item.market_cap?.toLocaleString()}</p>
              <button
                type="button"
                className="watchlist-star on"
                onClick={(e) => removeFromWatchlist(e, item.id)}
                aria-label="Remove from watchlist"
                title="Remove from watchlist"
              >
                ★
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Watchlist

import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CoinContext } from '../../context/CoinContext'
import { useAuth } from '../../context/AuthContext'
import '../Home/Home.css'
import './Coin.css'

const formatNum = (n) => {
  if (n == null) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return Number(n).toLocaleString()
}

const Coin = () => {
  const { coinId } = useParams()
  const navigate = useNavigate()
  const { currency } = useContext(CoinContext)
  const { user, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth()
  const [coin, setCoin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const curr = currency?.name || 'usd'
  const sym = currency?.symbol || '$'

  useEffect(() => {
    if (!coinId) return
    setLoading(true)
    setError(null)
    const opts = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-cg-demo-api-key': 'CG-w14FJSpHeSbfWMd7WzN6qjQg' },
    }
    fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      opts
    )
      .then((res) => {
        if (!res.ok) throw new Error('Coin not found')
        return res.json()
      })
      .then((data) => {
        setCoin(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [coinId])

  if (loading) {
    return (
      <div className="coin-page">
        <div className="coin-page-inner">
          <p className="coin-loading">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !coin) {
    return (
      <div className="coin-page">
        <div className="coin-page-inner">
          <p className="coin-error">{error || 'Coin not found'}</p>
          <button type="button" className="coin-back" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  const md = coin.market_data || {}
  const price = md.current_price?.[curr]
  const marketCap = md.market_cap?.[curr]
  const totalVol = md.total_volume?.[curr]
  const high24 = md.high_24h?.[curr]
  const low24 = md.low_24h?.[curr]
  const change24 = md.price_change_percentage_24h
  const ath = md.ath?.[curr]
  const athDate = md.ath_date?.[curr]
  const atl = md.atl?.[curr]
  const atlDate = md.atl_date?.[curr]
  const circSupply = md.circulating_supply
  const totalSupply = md.total_supply
  const maxSupply = md.max_supply
  const desc = coin.description?.en
  const links = coin.links || {}
  const homepage = links.homepage?.[0]
  const subreddit = links.subreddit_url

  return (
    <div className="coin-page">
      <div className="coin-page-inner">
        <button type="button" className="coin-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="coin-header">
          <img
            src={coin.image?.large || coin.image?.small}
            alt=""
            className="coin-header-icon"
          />
          <div>
            <h1 className="coin-title">
              {coin.name} <span className="coin-symbol">({coin.symbol?.toUpperCase()})</span>
            </h1>
            <p className="coin-rank">Rank #{coin.market_cap_rank ?? '—'}</p>
          </div>
          {user && (
            <button
              type="button"
              className={`coin-watchlist-btn ${isInWatchlist(coin.id) ? 'on' : ''}`}
              onClick={() => isInWatchlist(coin.id) ? removeFromWatchlist(coin.id) : addToWatchlist(coin.id)}
              title={isInWatchlist(coin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
              aria-label={isInWatchlist(coin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <span className="coin-watchlist-icon" aria-hidden>★</span>
              {isInWatchlist(coin.id) ? 'In watchlist' : 'Add to watchlist'}
            </button>
          )}
        </div>

        <div className="coin-price-block">
          <span className="coin-price-label">Price</span>
          <span className="coin-price">{sym}{price != null ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : '—'}</span>
          {change24 != null && (
            <span className={`coin-change ${change24 >= 0 ? 'green' : 'red'}`}>
              {change24 >= 0 ? '+' : ''}{(Math.round(change24 * 100) / 100)}% (24h)
            </span>
          )}
        </div>

        <div className="coin-stats-grid">
          <div className="coin-stat">
            <span className="coin-stat-label">Market Cap</span>
            <span className="coin-stat-value">{sym}{marketCap != null ? formatNum(marketCap) : '—'}</span>
          </div>
          <div className="coin-stat">
            <span className="coin-stat-label">24h Volume</span>
            <span className="coin-stat-value">{sym}{totalVol != null ? formatNum(totalVol) : '—'}</span>
          </div>
          <div className="coin-stat">
            <span className="coin-stat-label">24h High</span>
            <span className="coin-stat-value">{sym}{high24 != null ? high24.toLocaleString() : '—'}</span>
          </div>
          <div className="coin-stat">
            <span className="coin-stat-label">24h Low</span>
            <span className="coin-stat-value">{sym}{low24 != null ? low24.toLocaleString() : '—'}</span>
          </div>
          <div className="coin-stat">
            <span className="coin-stat-label">All-Time High</span>
            <span className="coin-stat-value">{sym}{ath != null ? ath.toLocaleString() : '—'}</span>
            {athDate && <span className="coin-stat-meta">{new Date(athDate).toLocaleDateString()}</span>}
          </div>
          <div className="coin-stat">
            <span className="coin-stat-label">All-Time Low</span>
            <span className="coin-stat-value">{sym}{atl != null ? atl.toLocaleString() : '—'}</span>
            {atlDate && <span className="coin-stat-meta">{new Date(atlDate).toLocaleDateString()}</span>}
          </div>
          <div className="coin-stat">
            <span className="coin-stat-label">Circulating Supply</span>
            <span className="coin-stat-value">{circSupply != null ? formatNum(circSupply) + ' ' + (coin.symbol?.toUpperCase() || '') : '—'}</span>
          </div>
          <div className="coin-stat">
            <span className="coin-stat-label">Total Supply</span>
            <span className="coin-stat-value">
              {totalSupply != null ? formatNum(totalSupply) + ' ' + (coin.symbol?.toUpperCase() || '') : maxSupply != null ? formatNum(maxSupply) : '—'}
            </span>
          </div>
        </div>

        {desc && (
          <section className="coin-description">
            <h2>About</h2>
            <p>{desc.replace(/<[^>]+>/g, '')}</p>
          </section>
        )}

        <section className="coin-links">
          <h2>Links</h2>
          <div className="coin-links-list">
            {homepage && (
              <a href={homepage} target="_blank" rel="noopener noreferrer" className="coin-link">
                Website
              </a>
            )}
            {subreddit && (
              <a href={subreddit} target="_blank" rel="noopener noreferrer" className="coin-link">
                Reddit
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Coin

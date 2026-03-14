import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css'
import { CoinContext } from '../../context/CoinContext'
import { useAuth } from '../../context/AuthContext'

const ONBOARDING_TOOLTIP_KEY = 'crypto_app_onboarding_seen';

function getTimeAgo(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const Home = () => {
  const { allCoin, currency, lastUpdated } = useContext(CoinContext);
  const { user, isInWatchlist, addToWatchlist, removeFromWatchlist, watchlistIds } = useAuth();
  const [displayCoin, setDisplayCoin] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnboardingTip, setShowOnboardingTip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDisplayCoin(allCoin);
  }, [allCoin]);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARDING_TOOLTIP_KEY)) setShowOnboardingTip(true);
    } catch (_) {}
  }, []);

  const dismissOnboarding = () => {
    setShowOnboardingTip(false);
    try {
      localStorage.setItem(ONBOARDING_TOOLTIP_KEY, '1');
    } catch (_) {}
  };

  const filteredCoins = searchTerm.trim()
    ? displayCoin.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : displayCoin.slice(2, 20);

  const isLoading = allCoin.length === 0 && !searchTerm;
  const watchlistIdsNorm = watchlistIds || [];
  const watchlistCoins = watchlistIdsNorm
    .map((id) => allCoin.find((c) => c.id === id || (c.id && c.id.toLowerCase() === id)))
    .filter(Boolean);
  const portfolioValue = watchlistCoins.reduce((s, c) => s + (c.current_price || 0), 0);
  const portfolioChange = watchlistCoins.length
    ? watchlistCoins.reduce((s, c) => s + (c.price_change_percentage_24h || 0), 0) / watchlistCoins.length
    : 0;

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className='home'>
      {showOnboardingTip && (
        <div className="onboarding-tooltip" role="tooltip">
          <p>Search or tap a row to see details.</p>
          <button type="button" className="onboarding-tooltip-dismiss" onClick={dismissOnboarding}>
            Don&apos;t show again
          </button>
        </div>
      )}
      <div className='hero'>
        <span className='hero-tag'>CRYPTO & FINANCE</span>
        <h1>Track prices. Save favorites. <br/> Get alerted.</h1>
        <p>Real-time data, watchlists, and price alerts in one place. No clutter—just the coins you care about.</p>
        <div className="hero-actions">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder='Search Crypto'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search crypto"
            />
            <button type='submit'>Search</button>
          </form>
          <div className="hero-cta-row">
            <Link to="/market" className="hero-cta-secondary">Explore market</Link>
            {user && watchlistCoins.length > 0 && (
              <Link to="/watchlist" className="hero-summary-pill" aria-label="Watchlist summary">
                <span className="hero-summary-pill-label">Watchlist</span>
                {currency.symbol}{portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <span className={portfolioChange >= 0 ? 'green' : 'red'}>
                  {portfolioChange >= 0 ? '+' : ''}{(Math.round(portfolioChange * 100) / 100)}%
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="table-meta">
        {lastUpdated && <span className="table-updated">Updated {getTimeAgo(lastUpdated)}</span>}
      </div>
      <div className={`crypto-table ${user ? 'has-watchlist' : ''}`}>
        <div className='table-layout' id="table-layout">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p style={{textAlign:'center'}}>24H Change</p>
          <p className='market-cap'>Market Cap</p>
          {user && <p></p>}
        </div>
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="table-layouts table-skeleton" aria-hidden="true">
                <span className="skeleton" />
                <span className="skeleton" />
                <span className="skeleton" />
                <span className="skeleton" />
                <span className="skeleton" />
                {user && <span className="skeleton" />}
              </div>
            ))}
          </>
        ) : filteredCoins.length === 0 ? (
          <div className="table-layouts" style={{ cursor: 'default', background: 'transparent' }}>
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px' }}>
              {searchTerm ? 'No coins match your search.' : 'No data yet.'}
            </p>
          </div>
        ) : (
        filteredCoins.map((item) => (
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
                <p>{item.name + "-" + item.symbol}</p>
              </div>
              <p>{currency.symbol} {item.current_price.toLocaleString()}</p>
              <p className={item.price_change_percentage_24h>0?'green':"red"}>
                {Math.floor(item.price_change_percentage_24h*100)/100}</p>
              <p className='market-cap'>{currency.symbol}{item.market_cap.toLocaleString()}</p>
              {user && (
                <button
                  type="button"
                  className={`watchlist-star ${isInWatchlist(item.id) ? 'on' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInWatchlist(item.id)) removeFromWatchlist(item.id);
                    else addToWatchlist(item.id);
                  }}
                  aria-label={isInWatchlist(item.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                  title={isInWatchlist(item.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  ★
                </button>
              )}
          </div>

        ))
        )
        }
      </div>
    </div>
  )
}

export default Home

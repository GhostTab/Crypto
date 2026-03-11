import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css'
import { CoinContext } from '../../context/CoinContext'
import { useAuth } from '../../context/AuthContext'

const Home = () => {

  const { allCoin, currency } = useContext(CoinContext);
  const { user, isInWatchlist, addToWatchlist, removeFromWatchlist } = useAuth();
  const [displayCoin, setDisplayCoin] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setDisplayCoin(allCoin);
  }, [allCoin]);

  const filteredCoins = searchTerm.trim()
    ? displayCoin.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : displayCoin.slice(2, 20);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className='home'>
      <div className='hero'>
        <h1>Step into <br/> the Future of Finance</h1>
        <p>Where Innovation Meets Security in the World of Digital Currency.</p>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder='Search Crypto'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type='submit'>Search</button>
        </form>
      </div>
      <div className={`crypto-table ${user ? 'has-watchlist' : ''}`}>
        <div className="red-circle"></div>
        <div className='table-layout' id="table-layout">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p style={{textAlign:'center'}}>24H Change</p>
          <p className='market-cap'>Market Cap</p>
          {user && <p></p>}
        </div>
        {
        filteredCoins.length === 0 ? (
          <div className="table-layouts" style={{ cursor: 'default', background: 'transparent' }}>
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px' }}>
              {searchTerm ? 'No coins match your search.' : 'Loading...'}
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

import { createContext,useEffect, useState } from 'react';


export const CoinContext = createContext();

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [currency, setCurrency] = useState({
    name: 'usd',
    symbol: '$',
  })

  const fetchAllCoin = async () => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-cg-demo-api-key': 'CG-w14FJSpHeSbfWMd7WzN6qjQg' },
    }
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}`, options)
      .then((res) => res.json())
      .then((data) => {
        setAllCoin(Array.isArray(data) ? data : [])
        setLastUpdated(new Date())
      })
      .catch((err) => {
        console.error(err)
        setLastUpdated(new Date())
      })
  }

  useEffect(() => {
    fetchAllCoin()
  }, [currency])

  const contextValue = {
    allCoin,
    currency,
    setCurrency,
    lastUpdated,
  }

    return(
        <CoinContext.Provider value={contextValue}>
            {props.children}
        </CoinContext.Provider>
    )

}

export default CoinContextProvider;
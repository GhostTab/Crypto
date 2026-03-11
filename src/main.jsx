import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import CoinContextProvider from './context/CoinContext.jsx'

// StrictMode disabled: Supabase auth uses a single storage lock; double-mount
// causes "Lock broken by another request with the 'steal' option" and aborts all requests.
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <CoinContextProvider>
        <App />
      </CoinContextProvider>
    </AuthProvider>
  </BrowserRouter>,
)

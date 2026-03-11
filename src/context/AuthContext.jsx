import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// Single auth subscription for the whole app (avoids Supabase storage lock contention
// when React remounts components). One listener, AuthProvider just registers a callback.
let authSubscription = null
let currentAuthCallback = null
function subscribeToAuth(callback) {
  currentAuthCallback = callback
  if (!authSubscription) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (currentAuthCallback) currentAuthCallback(event, session)
    })
    authSubscription = subscription
  }
  return () => { currentAuthCallback = null }
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

const CURRENCY_MAP = {
  usd: { name: 'usd', symbol: '$' },
  eur: { name: 'eur', symbol: '€' },
  php: { name: 'php', symbol: '₱' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [watchlistIds, setWatchlistIds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unregister = subscribeToAuth(async (event, session) => {
      setUser(session?.user ?? null)
      if (event === 'INITIAL_SESSION') setLoading(false)
      if (!session?.user) {
        setProfile(null)
        return
      }
      // Defer so auth token lock is released before we hit the API again
      const userId = session.user.id
      await new Promise((r) => setTimeout(r, 0))
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(data ?? null)
    })
    return unregister
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error) setProfile(data)
    else setProfile(null)
  }

  async function updateProfile(updates) {
    if (!user) return { error: new Error('Not logged in') }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  async function signUp(email, password, options = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options.full_name ? { full_name: options.full_name } : undefined,
      },
    })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setWatchlistIds([])
  }

  async function fetchWatchlist() {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('coin_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('[Watchlist] fetchWatchlist error:', error.message, error.code, error.details)
        throw error
      }
      console.log('[Watchlist] fetchWatchlist ok, count:', (data || []).length, 'ids:', (data || []).map((r) => r.coin_id))
      setWatchlistIds((data || []).map((r) => r.coin_id))
    } catch (e) {
      console.error('[Watchlist] fetchWatchlist caught:', e)
      setWatchlistIds([])
    }
  }

  useEffect(() => {
    if (!user) {
      setWatchlistIds([])
      return
    }
    const t = setTimeout(() => fetchWatchlist(), 50)
    return () => clearTimeout(t)
  }, [user?.id])

  async function addToWatchlist(coinId) {
    console.log('[Watchlist] addToWatchlist called, coinId:', coinId, 'typeof:', typeof coinId)
    if (!user) {
      console.warn('[Watchlist] addToWatchlist: no user, aborting')
      return { error: new Error('Not logged in') }
    }
    const id = String(coinId).toLowerCase().trim()
    const payload = { user_id: user.id, coin_id: id }
    console.log('[Watchlist] insert payload:', payload)

    const { data, error } = await supabase
      .from('watchlist')
      .insert(payload)
      .select()

    if (error) {
      console.error('[Watchlist] insert error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        full: error,
      })
      if (error.code === '23505') setWatchlistIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      return { error }
    }
    console.log('[Watchlist] insert success, row:', data)
    setWatchlistIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    return { error: null }
  }

  async function removeFromWatchlist(coinId) {
    if (!user) return { error: new Error('Not logged in') }
    const id = String(coinId).toLowerCase().trim()
    const { error } = await supabase.from('watchlist').delete().eq('user_id', user.id).eq('coin_id', id)
    if (!error) setWatchlistIds((prev) => prev.filter((x) => x !== id))
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    fetchProfile,
    fetchWatchlist,
    currency: profile ? CURRENCY_MAP[profile.currency] || CURRENCY_MAP.usd : null,
    watchlistIds: watchlistIds,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist: (coinId) => watchlistIds.includes(String(coinId).toLowerCase().trim()),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

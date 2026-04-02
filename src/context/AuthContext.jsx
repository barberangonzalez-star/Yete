import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, hasSupabase } from '../lib/supabase'

const AuthContext = createContext(null)

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (hasSupabase) {
      // Supabase auth — works across all devices
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
        } : null)
        setLoading(false)
      })
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
        } : null)
      })
      return () => subscription.unsubscribe()
    } else {
      // localStorage fallback
      setUser(load('auth_user', null))
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true); setError('')
    try {
      if (hasSupabase) {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) { setError(friendlyError(err.message)); setLoading(false); return false }
        setUser({ id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || email.split('@')[0] })
      } else {
        await new Promise(r => setTimeout(r, 700))
        const users = load('auth_users', [])
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (!found) { setError('No existe una cuenta con ese correo.'); setLoading(false); return false }
        if (found.password !== password) { setError('Contraseña incorrecta.'); setLoading(false); return false }
        const { password: _, ...safe } = found
        localStorage.setItem('auth_user', JSON.stringify(safe))
        setUser({ ...safe })
      }
      setLoading(false); return true
    } catch (e) { setError('Error inesperado. Intenta de nuevo.'); setLoading(false); return false }
  }

  const register = async (name, email, password) => {
    setLoading(true); setError('')
    try {
      if (hasSupabase) {
        const { data, error: err } = await supabase.auth.signUp({
          email, password, options: { data: { name } }
        })
        if (err) { setError(friendlyError(err.message)); setLoading(false); return false }
        if (data.user && !data.session) {
          setError('Revisa tu correo para confirmar tu cuenta.')
          setLoading(false); return false
        }
        setUser({ id: data.user.id, email: data.user.email, name })
      } else {
        await new Promise(r => setTimeout(r, 700))
        const users = load('auth_users', [])
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          setError('Ya existe una cuenta con ese correo.'); setLoading(false); return false
        }
        const newUser = { id: Date.now().toString(), name: name.trim(), email: email.trim().toLowerCase(), password, createdAt: new Date().toISOString() }
        localStorage.setItem('auth_users', JSON.stringify([...users, newUser]))
        const { password: _, ...safe } = newUser
        localStorage.setItem('auth_user', JSON.stringify(safe))
        setUser({ ...safe })
      }
      setLoading(false); return true
    } catch (e) { setError('Error inesperado. Intenta de nuevo.'); setLoading(false); return false }
  }

  const logout = async () => {
    if (hasSupabase) await supabase.auth.signOut()
    else localStorage.removeItem('auth_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout, hasSupabase }}>
      {children}
    </AuthContext.Provider>
  )
}

function friendlyError(msg) {
  if (msg.includes('Invalid login')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('already registered')) return 'Ya existe una cuenta con ese correo.'
  if (msg.includes('Password should')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (msg.includes('rate limit')) return 'Demasiados intentos. Espera un momento.'
  return msg
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

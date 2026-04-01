import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => load('auth_user', null))
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const login = async (email, password) => {
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 800))
    const users = load('auth_users', [])
    const found = users.find(u => u.email === email)
    if (!found) { setError('No existe una cuenta con ese correo.'); setLoading(false); return false }
    if (found.password !== password) { setError('Contraseña incorrecta.'); setLoading(false); return false }
    const { password: _, ...safe } = found
    setUser(safe)
    localStorage.setItem('auth_user', JSON.stringify(safe))
    setLoading(false)
    return true
  }

  const register = async (name, email, password) => {
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 800))
    const users = load('auth_users', [])
    if (users.find(u => u.email === email)) {
      setError('Ya existe una cuenta con ese correo.'); setLoading(false); return false
    }
    const newUser = { id: Date.now().toString(), name, email, password, createdAt: new Date().toISOString() }
    localStorage.setItem('auth_users', JSON.stringify([...users, newUser]))
    const { password: _, ...safe } = newUser
    setUser(safe)
    localStorage.setItem('auth_user', JSON.stringify(safe))
    setLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

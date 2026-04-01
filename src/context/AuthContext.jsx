import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => load('auth_user', null))
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const login = async (email, password) => {
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 700))

    const users = load('auth_users', [])
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (!found) {
      setError('No existe una cuenta con ese correo.')
      setLoading(false)
      return false
    }
    if (found.password !== password) {
      setError('Contraseña incorrecta.')
      setLoading(false)
      return false
    }

    const { password: _, ...safe } = found
    localStorage.setItem('auth_user', JSON.stringify(safe))
    setUser({ ...safe })
    setLoading(false)
    return true
  }

  const register = async (name, email, password) => {
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 700))

    const users = load('auth_users', [])
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('Ya existe una cuenta con ese correo.')
      setLoading(false)
      return false
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('auth_users', JSON.stringify([...users, newUser]))

    const { password: _, ...safe } = newUser
    localStorage.setItem('auth_user', JSON.stringify(safe))
    setUser({ ...safe })
    setLoading(false)
    return true
  }

  const logout = () => {
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

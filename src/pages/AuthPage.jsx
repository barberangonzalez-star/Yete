import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [mode,     setMode]     = useState('login')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const { login, register, loading, error, setError, hasSupabase } = useAuth()
  const navigate = useNavigate()

  const switchMode = m => { setMode(m); setError('') }

  const handleSubmit = async e => {
    e.preventDefault()
    let ok = false
    if (mode === 'login') {
      ok = await login(email, password)
    } else {
      if (!name.trim()) { setError('Escribe tu nombre.'); return }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
      ok = await register(name, email, password)
    }
    if (ok) navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-surface-0">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }}/>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}/>
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
        </svg>
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Finanzas</h1>
          <p className="text-white/40 mt-1 text-sm">Tu dinero, en control</p>
          {hasSupabase && (
            <p className="text-brand-500/70 text-xs mt-2">✓ Sincronización entre dispositivos activada</p>
          )}
        </div>

        <div className="card border border-white/[0.07]">
          {/* Tabs */}
          <div className="flex bg-surface-2 rounded-2xl p-1 mb-5">
            {[['login', 'Iniciar sesión'], ['register', 'Crear cuenta']].map(([m, label]) => (
              <button key={m} onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none ${
                  mode === m ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white/60'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-slide-up">
                <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Nombre</label>
                <input className="input-dark" type="text" placeholder="Tu nombre completo"
                  value={name} onChange={e => setName(e.target.value)}
                  autoCapitalize="words" autoComplete="name" required />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Correo</label>
              <input className="input-dark" type="email" placeholder="tu@correo.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" inputMode="email" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input className="input-dark" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required minLength={6} />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  <span>{mode === 'login' ? 'Entrando…' : 'Creando cuenta…'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-5">
          {hasSupabase
            ? 'Tu cuenta funciona en todos tus dispositivos.'
            : 'Datos guardados localmente en este dispositivo.'}
        </p>
      </div>
    </div>
  )
}

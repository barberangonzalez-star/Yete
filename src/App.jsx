import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FinanceProvider } from './context/FinanceContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-3xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
          <span className="text-2xl">💰</span>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/auth" replace />

  return (
    <FinanceProvider>
      <div className="flex h-screen overflow-hidden bg-surface-0">
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <MobileNav />
          <main className="flex flex-1 overflow-hidden">
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/gastos"   element={<Transactions />} />
              <Route path="/analisis" element={<Analytics />} />
              <Route path="/ajustes"  element={<Settings />} />
              <Route path="*"         element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </FinanceProvider>
  )
}

function AuthGuard() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (user) return <Navigate to="/" replace />
  return <AuthPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthGuard />} />
          <Route path="/*"   element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

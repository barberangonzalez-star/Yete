import React from 'react'
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

function ProtectedLayout() {
  const { user } = useAuth()
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
  const { user } = useAuth()
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

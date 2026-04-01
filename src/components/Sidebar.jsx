import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, List, BarChart2, Settings, LogOut, FileDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../context/FinanceContext'
import { getInitials, clsx } from '../utils/format'
import EntitySwitcher from './EntitySwitcher'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/gastos',   icon: List,            label: 'Movimientos' },
  { to: '/analisis', icon: BarChart2,        label: 'Análisis'   },
  { to: '/ajustes',  icon: Settings,         label: 'Ajustes'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { activeEntity } = useFinance()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/auth') }

  return (
    <aside className="flex flex-col h-full w-64 bg-surface-1 border-r border-white/[0.05] p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-1">
        <div className="w-9 h-9 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center glow-green-sm">
          <span className="text-brand-400 font-display font-bold text-sm">₮</span>
        </div>
        <div>
          <p className="font-display font-bold text-white text-sm leading-none">Finanzas</p>
          <p className="text-white/30 text-[10px] mt-0.5">Tu dinero, en control</p>
        </div>
      </div>

      {/* Current entity indicator */}
      <div className="flex items-center gap-2 px-2 mb-4">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: activeEntity?.color, boxShadow: `0 0 6px ${activeEntity?.color}80` }}/>
        <span className="text-xs text-white/40 truncate">{activeEntity?.name}</span>
      </div>

      {/* Entity switcher */}
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-white/20 px-2 mb-2">Planillas</p>
        <EntitySwitcher />
      </div>

      <div className="h-px bg-white/[0.05] mb-4" />

      {/* Nav */}
      <nav className="space-y-0.5 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-white/20 px-2 mb-2">Menú</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}>
            <Icon size={16} />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="mt-4 pt-4 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center text-xs font-medium text-brand-300">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">{user?.name}</p>
            <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm">
          <LogOut size={14} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

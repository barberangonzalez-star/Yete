import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, List, BarChart2, Settings, ChevronDown } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { clsx } from '../utils/format'
import EntitySwitcher from './EntitySwitcher'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Inicio'   },
  { to: '/gastos',   icon: List,            label: 'Gastos'   },
  { to: '/analisis', icon: BarChart2,        label: 'Análisis' },
  { to: '/ajustes',  icon: Settings,         label: 'Ajustes'  },
]

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink to={to} end={to === '/'}>
      {({ isActive }) => (
        <div className={clsx(
          'flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-200 select-none',
          isActive ? 'text-brand-400' : 'text-white/30'
        )}>
          <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
          <span className="text-[10px]">{label}</span>
        </div>
      )}
    </NavLink>
  )
}

export default function MobileNav() {
  const { activeEntity } = useFinance()
  const [showSwitcher, setShowSwitcher] = useState(false)

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-surface-1/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
            <span className="text-brand-400 font-display font-bold text-xs">₮</span>
          </div>
          <span className="font-display font-bold text-white text-sm">Finanzas</span>
        </div>

        <button onClick={() => setShowSwitcher(s => !s)}
          className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-white/[0.08] active:scale-95 transition-all select-none">
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: activeEntity?.color }}/>
          <span className="text-sm text-white/70 font-medium max-w-[110px] truncate">{activeEntity?.name}</span>
          <ChevronDown size={14} className={clsx('text-white/40 transition-transform duration-200', showSwitcher && 'rotate-180')}/>
        </button>
      </header>

      {showSwitcher && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setShowSwitcher(false)}>
          <div className="absolute top-16 right-4 left-4 glass border border-white/10 rounded-3xl p-4 shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}>
            <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3 px-1">Cambiar planilla</p>
            <EntitySwitcher onClose={() => setShowSwitcher(false)} />
          </div>
        </div>
      )}

      {/* Bottom nav with iPhone safe area */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex bg-surface-1/95 backdrop-blur-xl border-t border-white/[0.05] pb-safe">
        {NAV.map(item => <NavItem key={item.to} {...item} />)}
      </nav>
    </>
  )
}

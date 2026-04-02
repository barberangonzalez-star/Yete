import React from 'react'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, clsx } from '../utils/format'

export default function BudgetAlerts() {
  const { activeEntity, tags, getStats } = useFinance()
  const stats  = getStats()
  const budget = activeEntity?.budget || {}
  const alerts = []

  tags.forEach(tag => {
    const limit = budget[tag.id]
    if (!limit) return
    const spent = stats.byTag[tag.id] || 0
    const pct   = (spent / limit) * 100
    if (pct >= 70) alerts.push({ tag, spent, limit, pct })
  })

  if (!alerts.length) return null

  return (
    <div className="space-y-2">
      {alerts.map(({ tag, spent, limit, pct }) => (
        <div key={tag.id}
          className={clsx('flex items-start gap-3 px-4 py-3 rounded-2xl border',
            pct >= 100
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-amber-500/10 border-amber-500/20')}>
          <div className={clsx('mt-0.5 flex-shrink-0', pct >= 100 ? 'text-red-400' : 'text-amber-400')}>
            <AlertTriangle size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={clsx('text-sm font-medium', pct >= 100 ? 'text-red-300' : 'text-amber-300')}>
              {pct >= 100 ? 'Límite superado' : 'Acercándote al límite'} — {tag.icon} {tag.name}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#ef4444' : '#f59e0b' }}/>
              </div>
              <span className={clsx('text-[11px] font-mono flex-shrink-0', pct >= 100 ? 'text-red-400' : 'text-amber-400')}>
                {formatCurrency(spent)} / {formatCurrency(limit)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

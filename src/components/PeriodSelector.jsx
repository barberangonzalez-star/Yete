import React from 'react'
import { useFinance } from '../context/FinanceContext'
import { periodLabel, clsx } from '../utils/format'

const PERIODS = ['day', 'week', 'month', 'year', 'all']

export default function PeriodSelector({ className = '' }) {
  const { period, setPeriod } = useFinance()

  return (
    <div className={clsx('flex bg-surface-2 rounded-2xl p-1 gap-0.5', className)}>
      {PERIODS.map(p => (
        <button key={p} onClick={() => setPeriod(p)}
          className={clsx(
            'flex-1 py-1.5 px-2 rounded-xl text-xs font-medium transition-all duration-200',
            period === p
              ? 'bg-surface-4 text-white shadow-sm'
              : 'text-white/30 hover:text-white/60'
          )}>
          {periodLabel(p)}
        </button>
      ))}
    </div>
  )
}

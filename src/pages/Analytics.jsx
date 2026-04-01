import React, { useState } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency } from '../utils/format'
import PeriodSelector from '../components/PeriodSelector'
import { subDays, format, startOfWeek, startOfMonth, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e1e27',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: '#aaa',
      padding: 12,
      cornerRadius: 12,
      callbacks: { label: ctx => ` ${formatCurrency(ctx.raw)}` }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'DM Sans', size: 11 } },
      border: { display: false }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'DM Sans', size: 11 }, callback: v => '$' + (v>=1000 ? (v/1000).toFixed(0)+'k' : v) },
      border: { display: false }
    }
  }
}

export default function Analytics() {
  const { getFilteredTransactions, getStats, tags, entities, activeEntityId } = useFinance()
  const [view, setView] = useState('overview')

  const allTxs  = getFilteredTransactions()
  const stats   = getStats()

  // Daily trend last 14 days
  const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() })
  const dailyExpense = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return allTxs
      .filter(t => t.type === 'expense' && t.date.slice(0,10) === dayStr)
      .reduce((s,t) => s+t.amount, 0)
  })
  const dailyIncome = days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return allTxs
      .filter(t => t.type === 'income' && t.date.slice(0,10) === dayStr)
      .reduce((s,t) => s+t.amount, 0)
  })

  const trendData = {
    labels: days.map(d => format(d, 'd MMM', { locale: es })),
    datasets: [
      {
        label: 'Gastos',
        data: dailyExpense,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#ef4444',
      },
      {
        label: 'Ingresos',
        data: dailyIncome,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#22c55e',
      }
    ]
  }

  // By category bar
  const topTags = Object.entries(stats.byTag).sort((a,b) => b[1]-a[1]).slice(0,8)
  const barData = {
    labels: topTags.map(([id]) => tags.find(t=>t.id===id)?.name || id),
    datasets: [{
      data: topTags.map(([,v]) => v),
      backgroundColor: topTags.map(([id]) => (tags.find(t=>t.id===id)?.color || '#6b7280') + '99'),
      borderColor: topTags.map(([id]) => tags.find(t=>t.id===id)?.color || '#6b7280'),
      borderWidth: 1.5,
      borderRadius: 8,
      borderSkipped: false,
    }]
  }

  // All entities comparison
  const entitiesData = {
    labels: entities.map(e => e.name),
    datasets: [
      {
        label: 'Ingresos',
        data: entities.map(e => {
          const txs = getFilteredTransactions(e.id)
          return txs.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0)
        }),
        backgroundColor: 'rgba(34,197,94,0.7)',
        borderColor: '#22c55e',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Gastos',
        data: entities.map(e => {
          const txs = getFilteredTransactions(e.id)
          return txs.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0)
        }),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderColor: '#ef4444',
        borderWidth: 1.5,
        borderRadius: 6,
      }
    ]
  }

  const lineOpts = { ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: true, labels: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Sans', size: 11 }, boxWidth: 10, boxHeight: 10, borderRadius: 4 } } } }
  const groupedOpts = { ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins, legend: { display: true, labels: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Sans', size: 11 }, boxWidth: 10, boxHeight: 10, borderRadius: 4 } } }, scales: { ...CHART_OPTS.scales } }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-8 space-y-6">

        <div className="animate-slide-up">
          <h1 className="text-2xl font-display font-bold text-white">Análisis</h1>
          <p className="text-white/30 text-sm mt-0.5">Visualiza en qué gastas más</p>
        </div>

        <PeriodSelector />

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {[
            { label: 'Balance',  value: stats.balance, color: stats.balance >= 0 ? '#22c55e' : '#ef4444' },
            { label: 'Ingresos', value: stats.income,  color: '#22c55e' },
            { label: 'Gastos',   value: stats.expense, color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-sm font-mono font-semibold" style={{ color }}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Tendencia — últimos 14 días</p>
          <div style={{ height: 200 }}>
            <Line data={trendData} options={lineOpts} />
          </div>
        </div>

        {/* By category */}
        {topTags.length > 0 && (
          <div className="card animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Gastos por categoría</p>
            <div style={{ height: 220 }}>
              <Bar data={barData} options={CHART_OPTS} />
            </div>
          </div>
        )}

        {/* Entities comparison */}
        {entities.length > 1 && (
          <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Comparativa entre planillas</p>
            <div style={{ height: 200 }}>
              <Bar data={entitiesData} options={groupedOpts} />
            </div>
          </div>
        )}

        {/* Top spend table */}
        {topTags.length > 0 && (
          <div className="card animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Ranking de gastos</p>
            <div className="space-y-3">
              {topTags.map(([tagId, amount], i) => {
                const tag = tags.find(t => t.id === tagId)
                const pct = stats.expense > 0 ? (amount / stats.expense * 100) : 0
                return (
                  <div key={tagId} className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-white/20 w-5 text-right">{i+1}</span>
                    <span className="text-base">{tag?.icon || '📋'}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/70">{tag?.name || tagId}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-white">{formatCurrency(amount)}</span>
                          <span className="text-[10px] text-white/30 w-10 text-right">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: tag?.color || '#6b7280' }}/>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {topTags.length === 0 && (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">📊</span>
            <p className="text-white/50 text-sm font-medium">Sin datos para analizar</p>
            <p className="text-white/20 text-xs mt-1">Registra movimientos para ver tus estadísticas</p>
          </div>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Tooltip, Legend, Filler
} from 'chart.js'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency } from '../utils/format'
import PeriodSelector from '../components/PeriodSelector'
import { subDays, format, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler)

const BASE_OPTS = {
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
      ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, maxRotation: 0 },
      border: { display: false }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: {
        color: 'rgba(255,255,255,0.3)', font: { size: 10 },
        callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)
      },
      border: { display: false }
    }
  }
}

const LINE_OPTS = {
  ...BASE_OPTS,
  plugins: {
    ...BASE_OPTS.plugins,
    legend: {
      display: true,
      labels: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, boxWidth: 10, boxHeight: 10, borderRadius: 3 }
    }
  }
}

const GROUP_OPTS = {
  ...BASE_OPTS,
  plugins: {
    ...BASE_OPTS.plugins,
    legend: {
      display: true,
      labels: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, boxWidth: 10, boxHeight: 10, borderRadius: 3 }
    }
  }
}

export default function Analytics() {
  const { getFilteredTransactions, getStats, tags, entities } = useFinance()

  const stats  = getStats()
  const allTxs = getFilteredTransactions()

  // Daily trend — last 14 days
  const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() })
  const trendData = {
    labels: days.map(d => format(d, 'd MMM', { locale: es })),
    datasets: [
      {
        label: 'Gastos',
        data: days.map(d => {
          const s = format(d, 'yyyy-MM-dd')
          return allTxs.filter(t => t.type === 'expense' && t.date.slice(0, 10) === s).reduce((a, t) => a + t.amount, 0)
        }),
        borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#ef4444',
      },
      {
        label: 'Ingresos',
        data: days.map(d => {
          const s = format(d, 'yyyy-MM-dd')
          return allTxs.filter(t => t.type === 'income' && t.date.slice(0, 10) === s).reduce((a, t) => a + t.amount, 0)
        }),
        borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#22c55e',
      }
    ]
  }

  // By tag
  const topTags = Object.entries(stats.byTag).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const barData = {
    labels: topTags.map(([id]) => tags.find(t => t.id === id)?.name || id),
    datasets: [{
      data: topTags.map(([, v]) => v),
      backgroundColor: topTags.map(([id]) => (tags.find(t => t.id === id)?.color || '#6b7280') + '99'),
      borderColor: topTags.map(([id]) => tags.find(t => t.id === id)?.color || '#6b7280'),
      borderWidth: 1.5, borderRadius: 8, borderSkipped: false,
    }]
  }

  // Entities comparison
  const entitiesData = {
    labels: entities.map(e => e.name),
    datasets: [
      {
        label: 'Ingresos',
        data: entities.map(e => getFilteredTransactions(e.id).filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)),
        backgroundColor: 'rgba(34,197,94,0.7)', borderColor: '#22c55e', borderWidth: 1.5, borderRadius: 6,
      },
      {
        label: 'Gastos',
        data: entities.map(e => getFilteredTransactions(e.id).filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)),
        backgroundColor: 'rgba(239,68,68,0.7)', borderColor: '#ef4444', borderWidth: 1.5, borderRadius: 6,
      }
    ]
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 page-bottom lg:pb-8 space-y-5">

        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white">Análisis</h1>
          <p className="text-white/30 text-xs sm:text-sm mt-0.5">Visualiza en qué gastas más</p>
        </div>

        <PeriodSelector />

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Balance',  value: stats.balance,  color: stats.balance >= 0 ? '#22c55e' : '#ef4444' },
            { label: 'Ingresos', value: stats.income,   color: '#22c55e' },
            { label: 'Gastos',   value: stats.expense,  color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center p-3 sm:p-5">
              <p className="text-[9px] sm:text-[10px] text-white/30 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-xs sm:text-sm font-mono font-semibold truncate" style={{ color }}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {/* Trend */}
        <div className="card">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Tendencia — últimos 14 días</p>
          <div style={{ height: 180 }}>
            <Line data={trendData} options={LINE_OPTS} />
          </div>
        </div>

        {/* By category */}
        {topTags.length > 0 && (
          <div className="card">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Gastos por categoría</p>
            <div style={{ height: 200 }}>
              <Bar data={barData} options={BASE_OPTS} />
            </div>
          </div>
        )}

        {/* Entities comparison */}
        {entities.length > 1 && (
          <div className="card">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Comparativa entre planillas</p>
            <div style={{ height: 180 }}>
              <Bar data={entitiesData} options={GROUP_OPTS} />
            </div>
          </div>
        )}

        {/* Ranking */}
        {topTags.length > 0 ? (
          <div className="card">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Ranking de gastos</p>
            <div className="space-y-3">
              {topTags.map(([tagId, amount], i) => {
                const tag = tags.find(t => t.id === tagId)
                const pct = stats.expense > 0 ? (amount / stats.expense * 100) : 0
                return (
                  <div key={tagId} className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-white/20 w-4 text-right flex-shrink-0">{i + 1}</span>
                    <span className="text-base flex-shrink-0">{tag?.icon || '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/70 truncate">{tag?.name || tagId}</span>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs font-mono text-white">{formatCurrency(amount)}</span>
                          <span className="text-[10px] text-white/30 w-8 text-right">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: tag?.color || '#6b7280' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
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

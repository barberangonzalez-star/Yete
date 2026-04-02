import React, { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowRight, FileDown } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, clsx } from '../utils/format'
import PeriodSelector from '../components/PeriodSelector'
import TransactionItem from '../components/TransactionItem'
import AddTransactionModal from '../components/AddTransactionModal'
import BudgetAlerts from '../components/BudgetAlerts'
import { exportPDF } from '../utils/exportPdf'
import { useNavigate } from 'react-router-dom'

ChartJS.register(ArcElement, Tooltip, Legend)

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card flex-1 min-w-0">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] text-white/40 uppercase tracking-widest">{label}</p>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '20' }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p className="text-lg sm:text-2xl font-mono font-semibold text-white leading-none truncate">{value}</p>
      {sub && <p className="text-[10px] text-white/30 mt-1.5">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { activeEntity, getFilteredTransactions, getStats, tags, period } = useFinance()
  const [showAdd, setShowAdd] = useState(false)
  const navigate = useNavigate()

  const stats  = getStats()
  const txs    = getFilteredTransactions()
  const recent = txs.slice(0, 5)

  const topTags = Object.entries(stats.byTag).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const chartData = {
    labels: topTags.map(([id]) => tags.find(t => t.id === id)?.name || id),
    datasets: [{
      data: topTags.map(([, v]) => v),
      backgroundColor: topTags.map(([id]) => (tags.find(t => t.id === id)?.color || '#6b7280') + 'cc'),
      borderColor: topTags.map(([id]) => tags.find(t => t.id === id)?.color || '#6b7280'),
      borderWidth: 1.5,
      hoverOffset: 6,
    }]
  }

  const handleExport = () => {
    exportPDF({ entity: activeEntity, transactions: txs, tags, stats, period })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 page-bottom lg:pb-8 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl">{activeEntity?.emoji}</span>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white truncate">{activeEntity?.name}</h1>
            </div>
            <p className="text-white/30 text-xs sm:text-sm">Resumen financiero</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={handleExport}
              className="btn-ghost text-sm flex items-center gap-1.5 text-white/50 hover:text-white px-3 py-2">
              <FileDown size={15} />
              <span className="hidden sm:inline text-sm">PDF</span>
            </button>
            <button onClick={() => setShowAdd(true)}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm glow-green-sm">
              <Plus size={15} />
              <span>Agregar</span>
            </button>
          </div>
        </div>

        <PeriodSelector />
        <BudgetAlerts />

        {/* Stats row */}
        <div className="flex gap-2 sm:gap-3">
          <StatCard label="Balance" value={formatCurrency(stats.balance)}
            icon={Wallet} color={stats.balance >= 0 ? '#22c55e' : '#ef4444'}
            sub={`${stats.count} movimientos`} />
          <StatCard label="Ingresos" value={formatCurrency(stats.income)}
            icon={TrendingUp} color="#22c55e" />
          <StatCard label="Gastos" value={formatCurrency(stats.expense)}
            icon={TrendingDown} color="#ef4444" />
        </div>

        {/* Chart + categories */}
        {topTags.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Distribución de gastos</p>
              <div className="flex items-center justify-center" style={{ height: 180 }}>
                {stats.expense > 0 ? (
                  <Doughnut data={chartData} options={{
                    cutout: '68%',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: { label: ctx => ` ${formatCurrency(ctx.raw)}` },
                        backgroundColor: '#1e1e27',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        titleColor: '#fff',
                        bodyColor: '#aaa',
                        padding: 10,
                        cornerRadius: 12,
                      }
                    },
                    animation: { animateRotate: true, duration: 600 }
                  }} />
                ) : (
                  <p className="text-white/20 text-sm text-center">Sin gastos en este período</p>
                )}
              </div>
            </div>

            <div className="card">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Top categorías</p>
              <div className="space-y-3">
                {topTags.slice(0, 5).map(([tagId, amount]) => {
                  const tag = tags.find(t => t.id === tagId)
                  const pct = stats.expense > 0 ? (amount / stats.expense * 100) : 0
                  return (
                    <div key={tagId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm flex-shrink-0">{tag?.icon}</span>
                          <span className="text-xs text-white/60 truncate">{tag?.name || tagId}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs font-mono text-white/80">{formatCurrency(amount)}</span>
                          <span className="text-[10px] text-white/30 w-8 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: tag?.color || '#6b7280' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Últimos movimientos</p>
            {txs.length > 5 && (
              <button onClick={() => navigate('/gastos')}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                Ver todos <ArrowRight size={11} />
              </button>
            )}
          </div>

          {recent.length > 0 ? (
            <div className="card divide-y divide-white/[0.04] py-0 px-0 overflow-hidden">
              {recent.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-3">💸</span>
              <p className="text-white/50 text-sm font-medium">Sin movimientos en este período</p>
              <p className="text-white/20 text-xs mt-1">Pulsa "Agregar" para registrar tu primer movimiento</p>
            </div>
          )}
        </div>
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

import React, { useState, useMemo } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency } from '../utils/format'
import PeriodSelector from '../components/PeriodSelector'
import TransactionItem from '../components/TransactionItem'
import AddTransactionModal from '../components/AddTransactionModal'

export default function Transactions() {
  const { getFilteredTransactions, tags } = useFinance()
  const [showAdd,    setShowAdd]    = useState(false)
  const [search,     setSearch]     = useState('')
  const [filterTag,  setFilterTag]  = useState('')
  const [filterType, setFilterType] = useState('')

  const allTxs = getFilteredTransactions()

  const filtered = useMemo(() => allTxs.filter(tx => {
    const q = search.toLowerCase()
    const matchSearch = !q || tx.description?.toLowerCase().includes(q)
    const matchTag    = !filterTag  || tx.tagId === filterTag
    const matchType   = !filterType || tx.type  === filterType
    return matchSearch && matchTag && matchType
  }), [allTxs, search, filterTag, filterType])

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const hasFilters   = search || filterTag || filterType

  const clearFilters = () => { setSearch(''); setFilterTag(''); setFilterType('') }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6 page-bottom lg:pb-8 space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white">Movimientos</h1>
            <p className="text-white/30 text-xs sm:text-sm mt-0.5">{filtered.length} de {allTxs.length} registros</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm glow-green-sm">
            <Plus size={15} /> Agregar
          </button>
        </div>

        <PeriodSelector />

        {/* Mini summary */}
        <div className="flex gap-2">
          <div className="flex-1 glass rounded-2xl px-3 py-2.5 flex items-center gap-2">
            <div className="w-1 h-7 rounded-full bg-brand-500 flex-shrink-0"/>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Ingresos</p>
              <p className="text-sm font-mono font-medium text-brand-400">+{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <div className="flex-1 glass rounded-2xl px-3 py-2.5 flex items-center gap-2">
            <div className="w-1 h-7 rounded-full bg-red-500 flex-shrink-0"/>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Gastos</p>
              <p className="text-sm font-mono font-medium text-red-400">-{formatCurrency(totalExpense)}</p>
            </div>
          </div>
          <div className="flex-1 glass rounded-2xl px-3 py-2.5 flex items-center gap-2">
            <div className={`w-1 h-7 rounded-full flex-shrink-0 ${totalIncome - totalExpense >= 0 ? 'bg-brand-500' : 'bg-red-500'}`}/>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Neto</p>
              <p className={`text-sm font-mono font-medium ${totalIncome - totalExpense >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input className="input-dark pl-9 text-sm" placeholder="Buscar por descripción…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-1">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'expense', label: '↓ Gastos',   active: filterType === 'expense', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
            { key: 'income',  label: '↑ Ingresos', active: filterType === 'income',  cls: 'bg-brand-500/20 text-brand-400 border-brand-500/30' },
          ].map(({ key, label, active, cls }) => (
            <button key={key} onClick={() => setFilterType(f => f === key ? '' : key)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-200 font-medium select-none ${active ? cls : 'text-white/30 border-white/[0.06] hover:border-white/10 hover:text-white/50'}`}>
              {label}
            </button>
          ))}

          {tags.map(tag => (
            <button key={tag.id} onClick={() => setFilterTag(f => f === tag.id ? '' : tag.id)}
              className="text-xs px-3 py-1.5 rounded-xl border transition-all duration-200 font-medium select-none"
              style={filterTag === tag.id
                ? { background: tag.color + '25', color: tag.color, borderColor: tag.color + '40' }
                : { color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.06)' }}>
              {tag.icon} {tag.name}
            </button>
          ))}

          {hasFilters && (
            <button onClick={clearFilters}
              className="text-xs px-3 py-1.5 rounded-xl border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/20 transition-all duration-200 select-none">
              <X size={10} className="inline mr-1" /> Limpiar
            </button>
          )}
        </div>

        {/* List */}
        {filtered.length > 0 ? (
          <div className="card divide-y divide-white/[0.04] py-0 px-0 overflow-hidden">
            {filtered.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">{hasFilters ? '🔍' : '📭'}</span>
            <p className="text-white/50 text-sm font-medium">
              {hasFilters ? 'Sin resultados para ese filtro' : 'Sin movimientos en este período'}
            </p>
            <p className="text-white/20 text-xs mt-1">
              {hasFilters ? 'Prueba otros filtros o limpia la búsqueda' : 'Pulsa "Agregar" para empezar'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

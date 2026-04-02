import React, { useState, useEffect } from 'react'
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { clsx } from '../utils/format'

function localDateString() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dateToISO(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0).toISOString()
}

export default function AddTransactionModal({ onClose, initial }) {
  const { addTransaction, editTransaction, tags, activeEntity } = useFinance()
  const [type,        setType]        = useState(initial?.type || 'expense')
  const [amount,      setAmount]      = useState(initial?.amount?.toString() || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [tagId,       setTagId]       = useState(initial?.tagId || tags[0]?.id || '')
  const [date,        setDate]        = useState(
    initial?.date ? initial.date.slice(0, 10) : localDateString()
  )
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) { setError('Ingresa un monto válido mayor a 0.'); return }
    if (!tagId) { setError('Selecciona una categoría.'); return }
    setSubmitting(true)
    try {
      const txData = { type, amount: amt, description: description.trim(), tagId, date: dateToISO(date) }
      if (initial?.id) { editTransaction(initial.id, txData) }
      else             { addTransaction(txData) }
      onClose()
    } catch (err) {
      setError('Ocurrió un error. Intenta de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — ocupa hasta 90% del alto, con scroll interno */}
      <div
        className="relative w-full max-w-md glass border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up flex flex-col"
        style={{
          maxHeight: '90dvh',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar mobile */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-4 mb-2 sm:hidden flex-shrink-0" />

        {/* Header fijo */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-display font-bold text-white">
              {initial ? 'Editar movimiento' : 'Nuevo movimiento'}
            </h2>
            <p className="text-xs text-white/30 mt-0.5">{activeEntity?.emoji} {activeEntity?.name}</p>
          </div>
          <button onClick={onClose} type="button"
            className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="overflow-y-auto flex-1 px-5 pb-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Tipo */}
            <div className="flex bg-surface-3 rounded-2xl p-1 gap-1">
              <button type="button" onClick={() => setType('expense')}
                className={clsx('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none',
                  type === 'expense' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'text-white/30 hover:text-white/50')}>
                <ArrowDownCircle size={15} /> Gasto
              </button>
              <button type="button" onClick={() => setType('income')}
                className={clsx('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none',
                  type === 'income' ? 'bg-brand-500/15 text-brand-400 border brand-500/20' : 'text-white/30 hover:text-white/50')}>
                <ArrowUpCircle size={15} /> Ingreso
              </button>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Monto *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-mono">$</span>
                <input
                  autoFocus
                  className="input-dark pl-8 text-xl font-mono font-medium"
                  type="number" min="0.01" step="0.01" inputMode="decimal"
                  placeholder="0.00" value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">
                Descripción <span className="normal-case text-white/20">(opcional)</span>
              </label>
              <input className="input-dark" type="text" placeholder="¿En qué fue?"
                value={description} onChange={e => setDescription(e.target.value)} maxLength={100} />
            </div>

            {/* Categorías */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-2">Categoría *</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button type="button" key={tag.id} onClick={() => setTagId(tag.id)}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border select-none',
                      tagId === tag.id ? 'scale-105' : 'text-white/40 border-white/[0.06] hover:border-white/10 hover:text-white/60'
                    )}
                    style={tagId === tag.id
                      ? { background: tag.color + '25', borderColor: tag.color + '50', color: tag.color }
                      : {}}>
                    <span>{tag.icon}</span> {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Fecha</label>
              <input className="input-dark" type="date"
                value={date} onChange={e => setDate(e.target.value)}
                max={localDateString()} />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className={clsx(
                'btn-primary w-full flex items-center justify-center gap-2',
                type === 'expense' ? 'bg-red-500 hover:bg-red-400 focus:ring-red-500' : '',
                submitting ? 'opacity-60 cursor-not-allowed' : ''
              )}>
              {submitting && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {initial ? 'Guardar cambios' : type === 'expense' ? '+ Registrar gasto' : '+ Registrar ingreso'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

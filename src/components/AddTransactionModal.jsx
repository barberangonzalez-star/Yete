import React, { useState, useEffect } from 'react'
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { clsx } from '../utils/format'

export default function AddTransactionModal({ onClose, initial }) {
  const { addTransaction, editTransaction, tags, activeEntity } = useFinance()
  const [type, setType]   = useState(initial?.type || 'expense')
  const [amount, setAmount] = useState(initial?.amount?.toString() || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [tagId, setTagId] = useState(initial?.tagId || tags[0]?.id || '')
  const [date, setDate]   = useState(initial?.date ? initial.date.slice(0,10) : new Date().toISOString().slice(0,10))

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || isNaN(+amount) || +amount <= 0) return
    if (initial?.id) {
      editTransaction(initial.id, { type, amount: +amount, description, tagId, date: new Date(date).toISOString() })
    } else {
      addTransaction({ type, amount: +amount, description, tagId, date: new Date(date).toISOString() })
    }
    onClose()
  }

  const relevantTags = tags.filter(t => {
    if (type === 'income') return ['payroll','other','inventory'].includes(t.id) || !['food','transport','gas','health','entertain','services','marketing','rent','tools'].includes(t.id)
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md glass border border-white/10 rounded-3xl p-6 animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-display font-bold text-white">
              {initial ? 'Editar' : 'Nuevo'} movimiento
            </h2>
            <p className="text-xs text-white/30 mt-0.5">{activeEntity?.emoji} {activeEntity?.name}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex bg-surface-3 rounded-2xl p-1 gap-1">
            <button type="button" onClick={() => setType('expense')}
              className={clsx('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                type === 'expense' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'text-white/30 hover:text-white/50')}>
              <ArrowDownCircle size={15} /> Gasto
            </button>
            <button type="button" onClick={() => setType('income')}
              className={clsx('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                type === 'income' ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' : 'text-white/30 hover:text-white/50')}>
              <ArrowUpCircle size={15} /> Ingreso
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Monto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              <input autoFocus className="input-dark pl-8 text-xl font-mono font-medium" type="number" min="0.01" step="0.01"
                placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Descripción</label>
            <input className="input-dark" type="text" placeholder="¿En qué fue?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          {/* Tag */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button type="button" key={tag.id} onClick={() => setTagId(tag.id)}
                  className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border',
                    tagId === tag.id
                      ? 'text-white scale-105'
                      : 'text-white/40 border-white/[0.06] hover:border-white/10 hover:text-white/60'
                  )}
                  style={tagId === tag.id ? { background: tag.color + '25', borderColor: tag.color + '50', color: tag.color } : {}}>
                  <span>{tag.icon}</span> {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Fecha</label>
            <input className="input-dark" type="date" value={date} onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().slice(0,10)} />
          </div>

          {/* Submit */}
          <button type="submit"
            className={clsx('btn-primary w-full mt-2',
              type === 'expense' ? 'bg-red-500 hover:bg-red-400 focus:ring-red-500' : '')}>
            {initial ? 'Guardar cambios' : type === 'expense' ? 'Registrar gasto' : 'Registrar ingreso'}
          </button>
        </form>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Trash2, Pencil, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, formatDateShort, clsx } from '../utils/format'
import AddTransactionModal from './AddTransactionModal'

export default function TransactionItem({ tx, showEntity = false }) {
  const { tags, entities, deleteTransaction } = useFinance()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const tag    = tags.find(t => t.id === tx.tagId)
  const entity = entities.find(e => e.id === tx.entityId)
  const isIncome = tx.type === 'income'

  const handleDelete = () => {
    if (confirmDelete) { deleteTransaction(tx.id); return }
    setConfirmDelete(true)
    setTimeout(() => setConfirmDelete(false), 2500)
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.02] transition-all duration-200 group">
        {/* Icon */}
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: (tag?.color || '#6b7280') + '18', border: `1px solid ${tag?.color || '#6b7280'}25` }}>
          {tag?.icon || '📋'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {tx.description || tag?.name || 'Sin descripción'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-white/30">{formatDateShort(tx.date)}</span>
            {tag && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md font-medium"
                style={{ background: tag.color + '20', color: tag.color }}>
                {tag.name}
              </span>
            )}
            {showEntity && entity && (
              <span className="text-[11px] text-white/20">{entity.emoji} {entity.name}</span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className={clsx('text-sm font-mono font-medium', isIncome ? 'text-brand-400' : 'text-red-400')}>
              {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors">
              <Pencil size={12} />
            </button>
            <button onClick={handleDelete}
              className={clsx('w-7 h-7 rounded-xl flex items-center justify-center transition-all',
                confirmDelete
                  ? 'bg-red-500/20 text-red-400 animate-pulse'
                  : 'hover:bg-red-500/10 text-white/30 hover:text-red-400')}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {editing && <AddTransactionModal initial={tx} onClose={() => setEditing(false)} />}
    </>
  )
}

import React, { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { clsx } from '../utils/format'
import { Plus, Check, Settings } from 'lucide-react'

const EMOJIS = ['👤','🚀','🛍️','💡','🏪','📊','🎯','🏭','🌱','💎','🔥','⚡']
const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#06b6d4','#ec4899','#f97316','#84cc16','#8b5cf6']

export default function EntitySwitcher({ onClose }) {
  const { entities, activeEntityId, setActiveEntityId, addEntity, updateEntity, deleteEntity } = useFinance()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🚀')
  const [newColor, setNewColor] = useState('#3b82f6')
  const [editingId, setEditingId] = useState(null)

  const handleSwitch = (id) => {
    setActiveEntityId(id)
    onClose?.()
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    addEntity({ name: newName.trim(), emoji: newEmoji, color: newColor })
    setNewName(''); setAdding(false)
  }

  return (
    <div className="space-y-1.5">
      {entities.map(entity => (
        <div key={entity.id}
          onClick={() => handleSwitch(entity.id)}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all duration-200 group',
            activeEntityId === entity.id
              ? 'bg-white/[0.06] border border-white/[0.08]'
              : 'hover:bg-white/[0.03] border border-transparent'
          )}>
          {/* Emoji bubble */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: entity.color + '20', border: `1px solid ${entity.color}30` }}>
            {entity.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <p className={clsx('text-sm font-medium truncate', activeEntityId === entity.id ? 'text-white' : 'text-white/60')}>
              {entity.name}
            </p>
          </div>

          {activeEntityId === entity.id && (
            <Check size={14} className="text-brand-400 flex-shrink-0" />
          )}
        </div>
      ))}

      {/* Add new */}
      {adding ? (
        <form onSubmit={handleAdd} className="glass rounded-2xl p-3 space-y-2 animate-scale-in border border-brand-500/20">
          <input
            autoFocus
            className="input-dark text-sm py-2"
            placeholder="Nombre del negocio…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
          />
          {/* Emoji picker */}
          <div className="flex flex-wrap gap-1">
            {EMOJIS.map(em => (
              <button type="button" key={em} onClick={() => setNewEmoji(em)}
                className={clsx('w-8 h-8 rounded-lg text-sm transition-all', newEmoji === em ? 'bg-white/10 scale-110' : 'hover:bg-white/5')}>
                {em}
              </button>
            ))}
          </div>
          {/* Color picker */}
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map(c => (
              <button type="button" key={c} onClick={() => setNewColor(c)}
                className={clsx('w-5 h-5 rounded-full transition-all', newColor === c ? 'scale-125 ring-2 ring-white/40' : '')}
                style={{ background: c }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 py-2 text-sm">Agregar</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost flex-1 py-2 text-sm text-white/50">Cancelar</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-2xl w-full text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all duration-200 text-sm border border-dashed border-white/10 hover:border-white/20">
          <Plus size={14} />
          <span>Agregar planilla</span>
        </button>
      )}
    </div>
  )
}

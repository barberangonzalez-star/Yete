import React, { useState } from 'react'
import { Trash2, Plus, Save, AlertCircle, Check } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, getInitials } from '../utils/format'

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#06b6d4','#ec4899','#f97316','#84cc16','#8b5cf6']
const EMOJIS = ['👤','🚀','🛍️','💡','🏪','📊','🎯','🏭','🌱','💎','🔥','⚡','🎪','🦋','🌊']

function Section({ title, children }) {
  return (
    <div className="card space-y-4">
      <h2 className="text-xs font-display font-semibold text-white/60 uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, hasSupabase } = useAuth()
  const { entities, activeEntity, activeEntityId, addEntity, updateEntity, deleteEntity, tags, addTag, getStats } = useFinance()

  const [budgets, setBudgets] = useState(() => ({ ...activeEntity?.budget }))
  const [saved,   setSaved]   = useState(false)

  const [newEntityName,  setNewEntityName]  = useState('')
  const [newEntityEmoji, setNewEntityEmoji] = useState('🚀')
  const [newEntityColor, setNewEntityColor] = useState('#3b82f6')

  const [newTagName,  setNewTagName]  = useState('')
  const [newTagIcon,  setNewTagIcon]  = useState('📋')
  const [newTagColor, setNewTagColor] = useState('#6b7280')

  const stats = getStats()

  const handleSaveBudgets = () => {
    const cleaned = {}
    Object.entries(budgets).forEach(([k, v]) => { if (+v > 0) cleaned[k] = +v })
    updateEntity(activeEntityId, { budget: cleaned })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleAddEntity = e => {
    e.preventDefault()
    if (!newEntityName.trim()) return
    addEntity({ name: newEntityName.trim(), emoji: newEntityEmoji, color: newEntityColor })
    setNewEntityName('')
  }

  const handleAddTag = e => {
    e.preventDefault()
    if (!newTagName.trim()) return
    addTag({ name: newTagName.trim(), icon: newTagIcon, color: newTagColor })
    setNewTagName('')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 page-bottom lg:pb-8 space-y-5">

        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white">Ajustes</h1>
          <p className="text-white/30 text-xs sm:text-sm mt-0.5">Configura tu experiencia</p>
        </div>

        {/* Profile */}
        <Section title="Perfil">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center text-lg font-semibold text-brand-300 flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium truncate">{user?.name}</p>
              <p className="text-white/40 text-sm truncate">{user?.email}</p>
              {hasSupabase
                ? <p className="text-brand-500/70 text-xs mt-0.5">✓ Cuenta sincronizada entre dispositivos</p>
                : <p className="text-white/20 text-xs mt-0.5">Datos guardados localmente</p>
              }
            </div>
          </div>
        </Section>

        {/* Budgets */}
        <Section title={`Presupuesto mensual — ${activeEntity?.emoji} ${activeEntity?.name}`}>
          <p className="text-xs text-white/30 -mt-2">Define límites por categoría. Recibirás alertas al acercarte al 80% y al superarlo.</p>
          <div className="space-y-2">
            {tags.map(tag => {
              const spent = stats.byTag[tag.id] || 0
              const limit = +budgets[tag.id] || 0
              const pct   = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
              return (
                <div key={tag.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: tag.color + '20' }}>
                    {tag.icon}
                  </div>
                  <span className="text-sm text-white/60 flex-1 min-w-0 truncate">{tag.name}</span>
                  {spent > 0 && <span className="text-[10px] font-mono text-white/30 flex-shrink-0">{formatCurrency(spent)}</span>}
                  <div className="relative w-28 sm:w-36 flex-shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                    <input className="input-dark pl-6 py-2 text-sm text-right font-mono w-full"
                      type="number" min="0" inputMode="decimal" placeholder="Sin límite"
                      value={budgets[tag.id] || ''}
                      onChange={e => setBudgets(b => ({ ...b, [tag.id]: e.target.value }))} />
                  </div>
                  {limit > 0 && (
                    <div className="w-1.5 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0 relative">
                      <div className="absolute bottom-0 w-full rounded-full transition-all"
                        style={{ height: `${pct}%`, background: pct >= 100 ? '#ef4444' : '#22c55e' }}/>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <button onClick={handleSaveBudgets}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${saved ? 'bg-brand-600' : ''}`}>
            {saved ? <Check size={15}/> : <Save size={15}/>}
            {saved ? '¡Guardado!' : 'Guardar presupuestos'}
          </button>
        </Section>

        {/* Entities */}
        <Section title="Planillas">
          <div className="space-y-2">
            {entities.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl glass">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: e.color + '20' }}>
                  {e.emoji}
                </div>
                <span className="flex-1 text-sm text-white/70 truncate">{e.name}</span>
                {e.id === activeEntityId && (
                  <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg flex-shrink-0">Activa</span>
                )}
                {entities.length > 1 && e.id !== activeEntityId && (
                  <button onClick={() => {
                    if (confirm(`¿Eliminar "${e.name}"? Se borrarán sus movimientos.`)) deleteEntity(e.id)
                  }} className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0 p-1">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddEntity} className="space-y-3 pt-2 border-t border-white/[0.05]">
            <input className="input-dark text-sm" placeholder="Nombre de nueva planilla…"
              value={newEntityName} onChange={e => setNewEntityName(e.target.value)} />
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(em => (
                <button type="button" key={em} onClick={() => setNewEntityEmoji(em)}
                  className={`w-9 h-9 rounded-xl text-base transition-all select-none ${newEntityEmoji === em ? 'bg-white/15 scale-110' : 'hover:bg-white/5'}`}>
                  {em}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => setNewEntityColor(c)}
                  className={`w-6 h-6 rounded-full transition-all select-none ${newEntityColor === c ? 'scale-125 ring-2 ring-white/50' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
            <button type="submit" disabled={!newEntityName.trim()}
              className="btn-ghost w-full flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white disabled:opacity-40">
              <Plus size={14} /> Agregar planilla
            </button>
          </form>
        </Section>

        {/* Tags */}
        <Section title="Categorías">
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: tag.color + '20', color: tag.color, border: `1px solid ${tag.color}30` }}>
                {tag.icon} {tag.name}
              </div>
            ))}
          </div>
          <form onSubmit={handleAddTag} className="flex gap-2 pt-2 border-t border-white/[0.05]">
            <input className="input-dark text-sm flex-1" placeholder="Nueva categoría…"
              value={newTagName} onChange={e => setNewTagName(e.target.value)} />
            <input className="input-dark text-sm w-14 text-center px-2" placeholder="🏷️"
              value={newTagIcon} onChange={e => setNewTagIcon(e.target.value)} maxLength={2} />
            <button type="submit" disabled={!newTagName.trim()}
              className="btn-primary px-4 flex-shrink-0 disabled:opacity-40">
              <Plus size={14} />
            </button>
          </form>
        </Section>

        {/* Data */}
        <Section title="Datos y privacidad">
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/80">
              {hasSupabase
                ? 'Tu cuenta está sincronizada con Supabase. Funciona en todos tus dispositivos.'
                : 'Tus datos se guardan solo en este navegador. Para acceder desde otros dispositivos, activa Supabase.'}
            </p>
          </div>
          <button onClick={() => {
            if (confirm('¿Borrar TODOS tus datos permanentemente? Esta acción no se puede deshacer.')) {
              localStorage.clear(); window.location.reload()
            }
          }} className="w-full px-4 py-3 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-all duration-200">
            Borrar todos mis datos
          </button>
        </Section>
      </div>
    </div>
  )
}

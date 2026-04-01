import React, { useState } from 'react'
import { Trash2, Plus, Save, AlertCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, getInitials } from '../utils/format'

const COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#a855f7','#06b6d4','#ec4899','#f97316','#84cc16','#8b5cf6']
const EMOJIS = ['👤','🚀','🛍️','💡','🏪','📊','🎯','🏭','🌱','💎','🔥','⚡','🎪','🦋','🌊']

function Section({ title, children }) {
  return (
    <div className="card space-y-4">
      <h2 className="text-sm font-display font-semibold text-white/80 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const { entities, activeEntity, activeEntityId, addEntity, updateEntity, deleteEntity, tags, addTag, getStats } = useFinance()
  const [budgets, setBudgets] = useState(() => activeEntity?.budget || {})
  const [saved, setSaved]     = useState(false)

  // New entity form
  const [newEntityName,  setNewEntityName]  = useState('')
  const [newEntityEmoji, setNewEntityEmoji] = useState('🚀')
  const [newEntityColor, setNewEntityColor] = useState('#3b82f6')

  // New tag form
  const [newTagName,  setNewTagName]  = useState('')
  const [newTagIcon,  setNewTagIcon]  = useState('📋')
  const [newTagColor, setNewTagColor] = useState('#6b7280')

  const handleSaveBudgets = () => {
    const cleaned = {}
    Object.entries(budgets).forEach(([k,v]) => { if (+v > 0) cleaned[k] = +v })
    updateEntity(activeEntityId, { budget: cleaned })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAddEntity = (e) => {
    e.preventDefault()
    if (!newEntityName.trim()) return
    addEntity({ name: newEntityName.trim(), emoji: newEntityEmoji, color: newEntityColor })
    setNewEntityName('')
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (!newTagName.trim()) return
    addTag({ name: newTagName.trim(), icon: newTagIcon, color: newTagColor })
    setNewTagName('')
  }

  const stats = getStats()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-8 space-y-6">

        <div className="animate-slide-up">
          <h1 className="text-2xl font-display font-bold text-white">Ajustes</h1>
          <p className="text-white/30 text-sm mt-0.5">Configura tu experiencia</p>
        </div>

        {/* Profile */}
        <Section title="Perfil">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center text-lg font-semibold text-brand-300">
              {getInitials(user?.name)}
            </div>
            <div>
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-white/40 text-sm">{user?.email}</p>
            </div>
          </div>
        </Section>

        {/* Budget per tag */}
        <Section title={`Presupuesto mensual — ${activeEntity?.emoji} ${activeEntity?.name}`}>
          <p className="text-xs text-white/30">Define límites de gasto por categoría. Recibirás alertas al acercarte.</p>
          <div className="space-y-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: tag.color+'20' }}>
                  {tag.icon}
                </div>
                <span className="text-sm text-white/60 flex-1 min-w-0 truncate">{tag.name}</span>
                <div className="relative w-36">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                  <input className="input-dark pl-6 py-2 text-sm text-right font-mono w-full"
                    type="number" min="0" placeholder="Sin límite"
                    value={budgets[tag.id] || ''}
                    onChange={e => setBudgets(b => ({ ...b, [tag.id]: e.target.value }))} />
                </div>
                {stats.byTag[tag.id] > 0 && budgets[tag.id] > 0 && (
                  <div className="w-1.5 h-8 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                    <div className="w-full rounded-full transition-all"
                      style={{
                        height: `${Math.min((stats.byTag[tag.id] / +budgets[tag.id]) * 100, 100)}%`,
                        background: (stats.byTag[tag.id] / +budgets[tag.id]) >= 1 ? '#ef4444' : '#22c55e',
                        marginTop: 'auto',
                      }}/>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleSaveBudgets}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${saved ? 'bg-brand-600' : ''}`}>
            <Save size={14} />
            {saved ? '¡Guardado!' : 'Guardar presupuestos'}
          </button>
        </Section>

        {/* Planillas */}
        <Section title="Planillas">
          <div className="space-y-2">
            {entities.map(e => (
              <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl glass">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ background: e.color+'20' }}>
                  {e.emoji}
                </div>
                <span className="flex-1 text-sm text-white/70">{e.name}</span>
                {e.id === activeEntityId && (
                  <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg">Activa</span>
                )}
                {entities.length > 1 && e.id !== activeEntityId && (
                  <button onClick={() => deleteEntity(e.id)}
                    className="text-white/20 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddEntity} className="space-y-3">
            <input className="input-dark text-sm" placeholder="Nombre de nueva planilla…"
              value={newEntityName} onChange={e => setNewEntityName(e.target.value)} />
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map(em => (
                <button type="button" key={em} onClick={() => setNewEntityEmoji(em)}
                  className={`w-8 h-8 rounded-lg text-sm transition-all ${newEntityEmoji===em ? 'bg-white/15 scale-110' : 'hover:bg-white/5'}`}>
                  {em}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => setNewEntityColor(c)}
                  className={`w-5 h-5 rounded-full transition-all ${newEntityColor===c ? 'scale-125 ring-2 ring-white/40' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
            <button type="submit" className="btn-ghost w-full flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white">
              <Plus size={14} /> Agregar planilla
            </button>
          </form>
        </Section>

        {/* Tags */}
        <Section title="Categorías">
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: tag.color+'20', color: tag.color, border: `1px solid ${tag.color}30` }}>
                {tag.icon} {tag.name}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTag} className="flex gap-2">
            <input className="input-dark text-sm flex-1" placeholder="Nueva categoría…"
              value={newTagName} onChange={e => setNewTagName(e.target.value)} />
            <input className="input-dark text-sm w-16 text-center" placeholder="🏷️"
              value={newTagIcon} onChange={e => setNewTagIcon(e.target.value)} maxLength={2} />
            <button type="submit" className="btn-primary px-4 flex-shrink-0">
              <Plus size={14} />
            </button>
          </form>
        </Section>

        {/* Data */}
        <Section title="Datos">
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/80">Tus datos se guardan únicamente en este navegador. Para hacer respaldo, exporta tus reportes en PDF.</p>
          </div>
          <button
            onClick={() => {
              if (confirm('¿Estás seguro? Esto borrará todos tus datos permanentemente.')) {
                localStorage.clear(); window.location.reload()
              }
            }}
            className="w-full px-4 py-2.5 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm transition-all duration-200">
            Borrar todos mis datos
          </button>
        </Section>
      </div>
    </div>
  )
}

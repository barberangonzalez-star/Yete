import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const FinanceContext = createContext(null)

const DEFAULT_TAGS = [
  { id: 'food',      name: 'Comida',       color: '#f97316', icon: '🍔' },
  { id: 'transport', name: 'Transporte',   color: '#3b82f6', icon: '🚌' },
  { id: 'gas',       name: 'Gasolina',     color: '#ef4444', icon: '⛽' },
  { id: 'health',    name: 'Salud',        color: '#ec4899', icon: '💊' },
  { id: 'entertain', name: 'Ocio',         color: '#a855f7', icon: '🎬' },
  { id: 'services',  name: 'Servicios',    color: '#06b6d4', icon: '📱' },
  { id: 'payroll',   name: 'Nómina',       color: '#22c55e', icon: '💼' },
  { id: 'marketing', name: 'Marketing',    color: '#f59e0b', icon: '📣' },
  { id: 'inventory', name: 'Inventario',   color: '#84cc16', icon: '📦' },
  { id: 'rent',      name: 'Renta',        color: '#64748b', icon: '🏢' },
  { id: 'tools',     name: 'Herramientas', color: '#8b5cf6', icon: '🔧' },
  { id: 'other',     name: 'Otro',         color: '#6b7280', icon: '📋' },
]

const DEFAULT_ENTITIES = [
  { id: 'personal', name: 'Personal',  emoji: '👤', color: '#22c55e', budget: {} },
  { id: 'biz-1',    name: 'Negocio 1', emoji: '🚀', color: '#3b82f6', budget: {} },
  { id: 'biz-2',    name: 'Negocio 2', emoji: '🛍️', color: '#f59e0b', budget: {} },
]

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

export function FinanceProvider({ children }) {
  const [entities,       setEntities]       = useState(() => load('entities', DEFAULT_ENTITIES))
  const [activeEntityId, setActiveEntityId] = useState(() => load('activeEntityId', 'personal'))
  const [transactions,   setTransactions]   = useState(() => load('transactions', []))  // ← vacío por defecto
  const [tags,           setTags]           = useState(() => load('tags', DEFAULT_TAGS))
  const [period,         setPeriod]         = useState('month')

  useEffect(() => { save('entities',       entities)       }, [entities])
  useEffect(() => { save('activeEntityId', activeEntityId) }, [activeEntityId])
  useEffect(() => { save('transactions',   transactions)   }, [transactions])
  useEffect(() => { save('tags',           tags)           }, [tags])

  const activeEntity = entities.find(e => e.id === activeEntityId) || entities[0]

  const addTransaction = useCallback((tx) => {
    const newTx = {
      ...tx,
      id: uuidv4(),
      entityId: activeEntityId,
      date: tx.date || new Date().toISOString(),
    }
    setTransactions(prev => [newTx, ...prev])
    return newTx
  }, [activeEntityId])

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const editTransaction = useCallback((id, updates) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const addEntity = useCallback((entity) => {
    const newE = { ...entity, id: uuidv4(), budget: {} }
    setEntities(prev => [...prev, newE])
    return newE
  }, [])

  const updateEntity = useCallback((id, updates) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }, [])

  const deleteEntity = useCallback((id) => {
    if (entities.length <= 1) return
    setEntities(prev => prev.filter(e => e.id !== id))
    setTransactions(prev => prev.filter(t => t.entityId !== id))
    if (activeEntityId === id) {
      setActiveEntityId(entities.find(e => e.id !== id)?.id)
    }
  }, [entities, activeEntityId])

  const addTag = useCallback((tag) => {
    const newT = { ...tag, id: uuidv4() }
    setTags(prev => [...prev, newT])
    return newT
  }, [])

  const getFilteredTransactions = useCallback((entityId, customPeriod) => {
    const p   = customPeriod || period
    const now = new Date()
    let from

    if      (p === 'day')   { from = startOfLocalDay(now) }
    else if (p === 'week')  { const d = new Date(now); d.setDate(d.getDate() - 7); from = startOfLocalDay(d) }
    else if (p === 'month') { from = new Date(now.getFullYear(), now.getMonth(), 1) }
    else if (p === 'year')  { from = new Date(now.getFullYear(), 0, 1) }
    else                    { from = new Date(0) }

    const eid = entityId || activeEntityId
    return transactions.filter(t => t.entityId === eid && new Date(t.date) >= from)
  }, [transactions, period, activeEntityId])

  const getStats = useCallback((entityId) => {
    const txs     = getFilteredTransactions(entityId)
    const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const byTag   = {}
    txs.filter(t => t.type === 'expense').forEach(t => {
      byTag[t.tagId] = (byTag[t.tagId] || 0) + t.amount
    })
    return { income, expense, balance: income - expense, byTag, count: txs.length }
  }, [getFilteredTransactions])

  return (
    <FinanceContext.Provider value={{
      entities, activeEntityId, activeEntity,
      setActiveEntityId, addEntity, updateEntity, deleteEntity,
      transactions, addTransaction, deleteTransaction, editTransaction,
      tags, addTag,
      period, setPeriod,
      getFilteredTransactions, getStats,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be inside FinanceProvider')
  return ctx
}

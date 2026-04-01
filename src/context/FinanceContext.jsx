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

const DEMO_DATA = [
  { id: uuidv4(), type: 'expense', amount: 320, description: 'Super del lunes', tagId: 'food',      date: new Date(Date.now() - 1 * 86400000).toISOString(), entityId: 'personal' },
  { id: uuidv4(), type: 'expense', amount: 850, description: 'Gasolina semana', tagId: 'gas',       date: new Date(Date.now() - 2 * 86400000).toISOString(), entityId: 'personal' },
  { id: uuidv4(), type: 'income',  amount: 15000, description: 'Salario quincenal', tagId: 'payroll', date: new Date(Date.now() - 3 * 86400000).toISOString(), entityId: 'personal' },
  { id: uuidv4(), type: 'expense', amount: 200, description: 'Uber al aeropuerto', tagId: 'transport', date: new Date(Date.now() - 4 * 86400000).toISOString(), entityId: 'personal' },
  { id: uuidv4(), type: 'expense', amount: 3500, description: 'Renta oficina', tagId: 'rent',      date: new Date(Date.now() - 5 * 86400000).toISOString(), entityId: 'biz-1' },
  { id: uuidv4(), type: 'income',  amount: 12000, description: 'Cliente proyecto web', tagId: 'other',    date: new Date(Date.now() - 5 * 86400000).toISOString(), entityId: 'biz-1' },
  { id: uuidv4(), type: 'expense', amount: 1200, description: 'Meta Ads', tagId: 'marketing', date: new Date(Date.now() - 6 * 86400000).toISOString(), entityId: 'biz-1' },
  { id: uuidv4(), type: 'expense', amount: 450, description: 'Figma + Notion', tagId: 'tools',     date: new Date(Date.now() - 7 * 86400000).toISOString(), entityId: 'biz-2' },
  { id: uuidv4(), type: 'income',  amount: 8000, description: 'Venta productos', tagId: 'inventory', date: new Date(Date.now() - 8 * 86400000).toISOString(), entityId: 'biz-2' },
]

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function FinanceProvider({ children }) {
  const [entities, setEntities] = useState(() => load('entities', [
    { id: 'personal', name: 'Personal',      emoji: '👤', color: '#22c55e', budget: {} },
    { id: 'biz-1',    name: 'Negocio 1',     emoji: '🚀', color: '#3b82f6', budget: {} },
    { id: 'biz-2',    name: 'Negocio 2',     emoji: '🛍️', color: '#f59e0b', budget: {} },
  ]))
  const [activeEntityId, setActiveEntityId] = useState(() => load('activeEntityId', 'personal'))
  const [transactions, setTransactions] = useState(() => load('transactions', DEMO_DATA))
  const [tags, setTags] = useState(() => load('tags', DEFAULT_TAGS))
  const [period, setPeriod] = useState('month')

  useEffect(() => { save('entities', entities) }, [entities])
  useEffect(() => { save('activeEntityId', activeEntityId) }, [activeEntityId])
  useEffect(() => { save('transactions', transactions) }, [transactions])
  useEffect(() => { save('tags', tags) }, [tags])

  const activeEntity = entities.find(e => e.id === activeEntityId) || entities[0]

  const addTransaction = useCallback((tx) => {
    const newTx = { ...tx, id: uuidv4(), entityId: activeEntityId, date: tx.date || new Date().toISOString() }
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
    if (activeEntityId === id) setActiveEntityId(entities.find(e => e.id !== id)?.id)
  }, [entities, activeEntityId])

  const addTag = useCallback((tag) => {
    const newT = { ...tag, id: uuidv4() }
    setTags(prev => [...prev, newT])
    return newT
  }, [])

  const getFilteredTransactions = useCallback((entityId, customPeriod) => {
    const p = customPeriod || period
    const now = new Date()
    let from

    if (p === 'day') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (p === 'week') {
      from = new Date(now)
      from.setDate(now.getDate() - 7)
    } else if (p === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (p === 'year') {
      from = new Date(now.getFullYear(), 0, 1)
    } else {
      from = new Date(0)
    }

    return transactions.filter(t => {
      const byEntity = entityId ? t.entityId === entityId : t.entityId === activeEntityId
      const byDate = new Date(t.date) >= from
      return byEntity && byDate
    })
  }, [transactions, period, activeEntityId])

  const getStats = useCallback((entityId) => {
    const txs = getFilteredTransactions(entityId)
    const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance = income - expense
    const byTag = {}
    txs.filter(t => t.type === 'expense').forEach(t => {
      byTag[t.tagId] = (byTag[t.tagId] || 0) + t.amount
    })
    return { income, expense, balance, byTag, count: txs.length }
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

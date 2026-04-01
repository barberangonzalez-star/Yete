export function formatCurrency(amount, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' }).format(d)
}

export function periodLabel(period) {
  return { day: 'Hoy', week: 'Esta semana', month: 'Este mes', year: 'Este año', all: 'Todo' }[period] || period
}

export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function clsx(...args) {
  return args.filter(Boolean).join(' ')
}

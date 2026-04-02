import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatDate, periodLabel } from './format'

export function exportPDF({ entity, transactions, tags, stats, period }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const tagMap = Object.fromEntries(tags.map(t => [t.id, t]))

  // Header
  doc.setFillColor(10, 10, 15)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(34, 197, 94)
  doc.text('Finanzas', 14, 18)
  doc.setFontSize(11)
  doc.setTextColor(180, 180, 180)
  doc.text(entity.name + '  •  ' + periodLabel(period), 14, 28)
  doc.text('Generado: ' + new Date().toLocaleDateString('es-MX'), 14, 35)

  // Stats cards
  const cardY = 50
  const cards = [
    { label: 'Ingresos',  value: formatCurrency(stats.income),  color: [34, 197, 94] },
    { label: 'Gastos',    value: formatCurrency(stats.expense), color: [239, 68, 68] },
    { label: 'Balance',   value: formatCurrency(stats.balance), color: stats.balance >= 0 ? [34, 197, 94] : [239, 68, 68] },
  ]
  cards.forEach((c, i) => {
    const x = 14 + i * 63
    doc.setFillColor(24, 24, 31)
    doc.roundedRect(x, cardY, 60, 24, 3, 3, 'F')
    doc.setFontSize(9)
    doc.setTextColor(140, 140, 140)
    doc.text(c.label, x + 4, cardY + 8)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...c.color)
    doc.text(c.value, x + 4, cardY + 18)
  })

  // By tag breakdown
  const byTagY = cardY + 34
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(240, 240, 244)
  doc.text('Gastos por categoría', 14, byTagY)

  const tagRows = Object.entries(stats.byTag)
    .sort((a, b) => b[1] - a[1])
    .map(([tagId, amount]) => {
      const tag = tagMap[tagId]
      return [tag ? tag.name : tagId, formatCurrency(amount), ((amount / stats.expense) * 100).toFixed(1) + '%']
    })

  if (tagRows.length) {
    autoTable(doc, {
      startY: byTagY + 4,
      head: [['Categoría', 'Monto', '% del total']],
      body: tagRows,
      styles: { fontSize: 9, textColor: [200, 200, 210], fillColor: [24, 24, 31], lineColor: [40, 40, 50], lineWidth: 0.3 },
      headStyles: { fillColor: [30, 30, 40], textColor: [150, 150, 160], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [20, 20, 28] },
      margin: { left: 14, right: 14 },
    })
  }

  // Transactions table
  const txY = (doc.lastAutoTable?.finalY || byTagY + 10) + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(240, 240, 244)
  doc.text('Movimientos', 14, txY)

  const txRows = transactions.map(t => {
    const tag = tagMap[t.tagId]
    return [
      formatDate(t.date),
      t.description || '—',
      tag ? tag.name : '—',
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      (t.type === 'expense' ? '-' : '+') + formatCurrency(t.amount),
    ]
  })

  autoTable(doc, {
    startY: txY + 4,
    head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']],
    body: txRows,
    styles: { fontSize: 8, textColor: [200, 200, 210], fillColor: [24, 24, 31], lineColor: [40, 40, 50], lineWidth: 0.3 },
    headStyles: { fillColor: [30, 30, 40], textColor: [150, 150, 160], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [20, 20, 28] },
    margin: { left: 14, right: 14 },
    didParseCell(data) {
      if (data.column.index === 4 && data.section === 'body') {
        const raw = txRows[data.row.index]?.[4] || ''
        data.cell.styles.textColor = raw.startsWith('+') ? [34, 197, 94] : [239, 68, 68]
      }
    }
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(80, 80, 90)
    doc.text(`Página ${i} de ${pageCount}  •  Finanzas App`, 14, 290)
  }

  doc.save(`finanzas-${entity.name.replace(/\s/g, '-')}-${period}.pdf`)
}

# 💰 Finanzas App

App personal de finanzas para gestionar tus gastos, ingresos y emprendimientos. Desplegable en Vercel desde GitHub.

## ✨ Características

- 🔐 Inicio de sesión (usuarios locales)
- 🏢 Múltiples planillas (Personal + Negocios)
- 💸 Registro de gastos e ingresos con categorías
- 📊 Gráficas de análisis (pastel, barras, tendencia)
- 🔔 Alertas de presupuesto por categoría
- 📅 Filtros por día / semana / mes / año
- 📄 Exportación a PDF
- 📱 Diseño responsive (móvil + desktop)

---

## 🚀 Despliegue en Vercel desde GitHub

### Paso 1 — Subir a GitHub

```bash
# En tu terminal, dentro de la carpeta del proyecto:
git init
git add .
git commit -m "feat: finanzas app inicial"

# Crea un repositorio en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/finanzas-app.git
git branch -M main
git push -u origin main
```

### Paso 2 — Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub
2. Haz clic en **"Add New Project"**
3. Selecciona tu repositorio `finanzas-app`
4. Vercel detectará que es un proyecto **Vite** automáticamente
5. Confirma estas configuraciones:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Haz clic en **"Deploy"** 🚀

Tu app estará disponible en `https://finanzas-app-xxx.vercel.app` en ~2 minutos.

### Paso 3 — Actualizaciones futuras

Cada vez que hagas `git push`, Vercel redesplegará automáticamente:

```bash
git add .
git commit -m "tu mensaje"
git push
```

---

## 💻 Desarrollo local

```bash
npm install
npm run dev
```

La app estará en `http://localhost:5173`

---

## 🗂️ Estructura del proyecto

```
src/
├── context/
│   ├── AuthContext.jsx      # Autenticación (localStorage)
│   └── FinanceContext.jsx   # Estado global de finanzas
├── components/
│   ├── Sidebar.jsx          # Navegación desktop
│   ├── MobileNav.jsx        # Navegación móvil
│   ├── EntitySwitcher.jsx   # Cambio de planillas
│   ├── PeriodSelector.jsx   # Filtro de período
│   ├── AddTransactionModal  # Modal añadir/editar
│   ├── TransactionItem.jsx  # Item de lista
│   └── BudgetAlerts.jsx     # Alertas de presupuesto
├── pages/
│   ├── AuthPage.jsx         # Login / Registro
│   ├── Dashboard.jsx        # Pantalla principal
│   ├── Transactions.jsx     # Lista de movimientos
│   ├── Analytics.jsx        # Gráficas y análisis
│   └── Settings.jsx         # Ajustes y presupuestos
└── utils/
    ├── format.js            # Utilidades de formato
    └── exportPdf.js         # Generación de PDF
```

---

## 📝 Notas importantes

- **Los datos se guardan en `localStorage`** del navegador. Son privados y locales.
- Cada usuario del navegador tiene sus propios datos.
- Para respaldo, usa la exportación a PDF.
- No requiere backend ni base de datos externa.

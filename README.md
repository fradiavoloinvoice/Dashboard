# 🍕 Fradiavolo - Glovo Dashboard

Dashboard completa per monitorare performance delivery Glovo su 28 store Fradiavolo.

## 📁 Struttura

```
├── server.js          # Express server
├── controller.js      # Business logic + calcolo KPI
├── googleSheets.js    # Google Sheets API + cache
├── dashboard.html     # Frontend (file singolo HTML)
├── package.json
├── .env.example
└── README.md
```

## ⚡ Quick Start (3 Minuti!)

### 1. Installa Dipendenze
```bash
npm install
```

### 2. Configura .env
```bash
cp .env.example .env
# Modifica .env con le tue credenziali Google
```

Inserisci in `.env`:
- `GOOGLE_SERVICE_ACCOUNT_KEY`: JSON service account Google
- `GOOGLE_SHEET_ID`: ID del tuo Google Sheet

### 3. Avvia Backend
```bash
npm start
```

Server attivo su: http://localhost:3000

### 4. Apri Dashboard
Apri `dashboard.html` nel browser (doppio click) oppure:
```bash
open dashboard.html  # Mac
xdg-open dashboard.html  # Linux
start dashboard.html  # Windows
```

## 📊 Struttura Google Sheet

Il backend legge questi 4 fogli:

### ADS
```
Store, SID, SAID, Placement, Week (date ISO), Impressions, Clicks, 
Attributed orders, Total ads, Ads glovo, Ads fradiavolo, GMV generate, ROAS, CTR
```

### ORDERS
```
WEEK NUMBER, CITY CODE, SID, SAID, ADDRESS, DELIVERED ORDERS, GMV
```

### OPS
```
WEEK NUMBER, STORE NAME, CITY CODE, SID, SAID, ADDRESS, TOTAL ORDERS, 
DELIVERED ORDERS, TOT DELIVERY TIME, PREP TIME, aWTP, WMI, CDTP, UPTIME, RATING
```

### PROMO
```
WEEK NUMBER, CITY, SAID, ADDRESS, PRODUCT PROMO by Partner, 
DELIVERY PROMO by Partner, TOTAL SPENT, GLOVO SPENDING
```

## ✅ Features

### Backend
- ✅ **Unico endpoint** `/api/data` con tutto
- ✅ **Cache 5 minuti** per ridurre chiamate Google API
- ✅ **Filtri dinamici** (settimana, città, store)
- ✅ **28 store mapping** con SAID reali
- ✅ **Week extraction** da date ISO (2025-11-10 → 2025-W46)

### Frontend
- ✅ **5 Tab**: Overview, Performance Stores, Advertising, Promotions, Operations
- ✅ **8 KPI Cards**: Spesa, Ordini, GMV, Impressions, Click, CTR, CPM, CPO
- ✅ **Filtri Dropdown**: Settimana, Città, Store
- ✅ **Cofund Progress Bar**: Budget €100k hardcoded
- ✅ **Tabelle Responsive**: Ranking store, campagne ads
- ✅ **Alert Operations**: Rating, WMI, Uptime colorati

## 🎯 API Endpoint

### GET /api/data
Query params:
- `week`: ISO week (es: `2025-W46`) o `all`
- `city`: Nome città o `all`
- `store`: SAID store o `all`

Response:
```json
{
  "filters": { "weeks": [...], "cities": [...], "stores": [...] },
  "kpis": { "totalSpend": 45678, "totalOrders": 1234, ... },
  "stores": [ { "id": "740760", "name": "FDV Brescia centro", ... } ],
  "ads": { "totalSpend": ..., "campaigns": [...] },
  "promo": { "totalInvest": ..., "topStores": {...} },
  "ops": { "avgRating": 4.8, "alerts": [...] }
}
```

## 🔧 Troubleshooting

### "week=undefined" nel backend
✅ FIXED: Filtri hanno default `'all'`

### Dropdown settimane vuoto
✅ FIXED: Estrazione week da colonna corretta (index 4 in ADS)

### Cache non funziona
Controlla logs:
```
📦 Cache HIT (age: 5s)  ← OK
🔄 Fetching fresh data  ← Primo fetch
```

### Errore Google Sheets API
Verifica:
1. Service Account JSON corretto in `.env`
2. Sheet ID corretto
3. Service Account ha accesso al Google Sheet (share con email service account)

## 📈 Performance

- ✅ **Prima richiesta**: ~2s (fetch Google Sheets)
- ✅ **Richieste successive**: ~50ms (cache hit)
- ✅ **90% riduzione** chiamate Google API

## 🎨 Personalizzazione

### Colori Gradient
Modifica in `dashboard.html`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Cofund Budget
Modifica in `controller.js`:
```javascript
const cofundBudget = 100000; // €
```

## 🚀 Deploy

Per produzione usa:
- Backend: Vercel, Railway, Render
- Frontend: Netlify, Vercel, GitHub Pages

## 📝 Note

- Date nel foglio ADS devono essere formato ISO: `2025-11-10`
- Week number in ORDERS/OPS/PROMO devono essere 1-52
- SAID è la chiave comune tra tutti i fogli
- Cache TTL modificabile in `googleSheets.js`

---

**Creato con ❤️ per Fradiavolo Pizzeria**

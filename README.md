# Fradiavolo Dashboard

Dashboard analytics multi-piattaforma per delivery: Glovo, Deliveroo, Just Eat.

## Struttura

```
├── server.js              # Express server principale
├── googleSheets.js        # Google Sheets API + cache
├── glovoController.js     # Controller Glovo
├── deliverooController.js # Controller Deliveroo
├── justeatController.js   # Controller Just Eat
├── combinedController.js  # Controller comparativo
├── fatturatoController.js # Controller fatturato
├── recensioniController.js # Controller recensioni/NPS
├── deliveryReportController.js # Report delivery
├── unifiedController.js   # Dashboard unificata
├── index.html             # Landing page
├── dash.html              # Dashboard principale
├── glovo.html             # Analytics Glovo
├── deliveroo.html         # Analytics Deliveroo
├── justeat.html           # Analytics Just Eat
├── combined.html          # Comparativo multi-piattaforma
├── fatturato.html         # Andamento fatturati
├── recensioni.html        # Recensioni e NPS
├── stores.html            # Gestione stores
└── delivery-report.html   # Report costi delivery
```

## Quick Start

### 1. Installa Dipendenze
```bash
npm install
```

### 2. Configura .env
```bash
cp .env.example .env
```

Inserisci in `.env`:
- `GOOGLE_SERVICE_ACCOUNT_KEY`: JSON service account Google
- `GOOGLE_SHEET_ID`: ID Google Sheet principale
- `GOOGLE_SHEET_FATTURATO_ID`: ID Sheet fatturato
- `GOOGLE_SHEET_RECENSIONI_ID`: ID Sheet recensioni

### 3. Avvia Server
```bash
npm start
```

Server attivo su: http://localhost:3000

## API Endpoints

| Endpoint | Descrizione |
|----------|-------------|
| `/api/glovo` | Analytics Glovo |
| `/api/deliveroo` | Analytics Deliveroo |
| `/api/justeat` | Analytics Just Eat |
| `/api/combined` | Comparativo multi-piattaforma |
| `/api/fatturato` | Dati fatturato |
| `/api/recensioni` | Recensioni e NPS |
| `/api/delivery-report` | Report costi delivery |
| `/api/health` | Health check |

## Deploy su Render

### 1. Crea Web Service
1. Vai su https://render.com
2. New → Web Service
3. Connetti il repository GitHub
4. Configura:
   - **Name**: fradiavolo-dashboard
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2. Environment Variables
Aggiungi su Render (Settings → Environment):
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SHEET_FATTURATO_ID=your_fatturato_sheet_id
GOOGLE_SHEET_RECENSIONI_ID=your_recensioni_sheet_id
PORT=10000
```

**IMPORTANTE**: Il valore di `GOOGLE_SERVICE_ACCOUNT_KEY` deve essere il JSON completo su una sola riga.

### 3. Deploy
Render fa il deploy automatico ad ogni push su main.

## Features

- Dashboard responsive (desktop, tablet, mobile)
- Hamburger menu per navigazione mobile
- Cache 5 minuti per ridurre chiamate API
- Multi-select per filtri settimane e citta
- Grafici interattivi con Chart.js
- Export dati
- Confronto performance tra piattaforme

## Performance

- Prima richiesta: ~2s (fetch Google Sheets)
- Richieste successive: ~50ms (cache hit)
- Cache TTL: 5 minuti

---

**Creato per Fradiavolo Pizzeria**

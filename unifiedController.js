import { getGlovoSheetsData, getDeliverooSheetsData, getFatturatoSheetsData } from './googleSheets.js';

// ===== STORE MAPPING =====
const GLOVO_STORE_MAPPING = {
  '740760': { name: 'FDV Brescia', city: 'Brescia' },
  '545781': { name: 'FDV Milano Premuda', city: 'Milano' },
  '507522': { name: 'FDV Torino GM', city: 'Torino' },
  '507496': { name: 'FDV Milano Isola', city: 'Milano' },
  '507533': { name: 'FDV Torino IV Marzo', city: 'Torino' },
  '815275': { name: 'FDV Roma Trastevere', city: 'Roma' },
  '740740': { name: 'FDV Genova Mare', city: 'Genova' },
  '740780': { name: 'FDV Asti', city: 'Asti' },
  '507853': { name: 'FDV Novara', city: 'Novara' },
  '740792': { name: 'FDV Torino Vanchiglia', city: 'Torino' },
  '509049': { name: 'FDV Parma', city: 'Parma' },
  '587232': { name: 'FDV Alessandria', city: 'Alessandria' },
  '509021': { name: 'FDV Genova Castello', city: 'Genova' },
  '740615': { name: 'FDV Milano Porta venezia', city: 'Milano' },
  '507881': { name: 'FDV Milano Sempione', city: 'Milano' },
  '507365': { name: 'FDV Torino Carlina', city: 'Torino' },
  '507754': { name: 'FDV Varese', city: 'Varese' },
  '507813': { name: 'FDV Bologna S.Stefano', city: 'Bologna' },
  '507436': { name: 'FDV Roma parioli', city: 'Roma' },
  '740635': { name: 'FDV Monza', city: 'Monza' },
  '529034': { name: 'FDV Milano Bicocca', city: 'Milano' },
  '740768': { name: 'FDV Rimini', city: 'Rimini' },
  '509067': { name: 'FDV Milano Citylife', city: 'Milano' },
  '740789': { name: 'FDV Roma ostiense', city: 'Roma' },
  '594795': { name: 'FDV Torino S.Salvario', city: 'Torino' },
  '740732': { name: 'FDV Modena', city: 'Modena' },
  '507567': { name: 'FDV Arese', city: 'Arese' },
  '746379': { name: 'FDV Casalecchio', city: 'Casalecchio' },
  '507770': { name: 'FDV Brescia', city: 'Brescia' },
  '746334': { name: 'FDV Rivoli', city: 'Rivoli' },
  '881244': { name: 'FDV Arese', city: 'Arese' }
};

const DELIVEROO_TO_GLOVO_MAPPING = {
  'Fra Diavolo (Torino Madre)': 'FDV TORINO GM',
  'Fra Diavolo - Alessandria': 'FDV ALESSANDRIA',
  'Fra Diavolo - Arese': 'FDV ARESE',
  'Fra Diavolo - Asti': 'FDV ASTI',
  'Fra Diavolo - Bicocca': 'FDV MILANO BICOCCA',
  'Fra Diavolo - Brescia': 'FDV BRESCIA',
  'Fra Diavolo - Brescia Centro': 'FDV BRESCIA',
  'Fra Diavolo - Casalecchio': 'FDV CASALECCHIO',
  'Fra Diavolo - City Life': 'FDV MILANO CITYLIFE',
  'Fra Diavolo - Genova': 'FDV GENOVA CASTELLO',
  'Fra Diavolo - Genova Mare': 'FDV GENOVA MARE',
  'Fra Diavolo - Milano': 'FDV MILANO SEMPIONE',
  'Fra Diavolo - Milano Premuda': 'FDV MILANO PREMUDA',
  'Fra Diavolo - Modena': 'FDV MODENA',
  'Fra Diavolo - Monza': 'FDV MONZA',
  'Fra Diavolo - Parma': 'FDV PARMA',
  'Fra Diavolo - Porta Venezia': 'FDV PORTA VENEZIA',
  'Fra Diavolo - Rimini': 'FDV RIMINI',
  'Fra Diavolo - Rivoli': 'FDV RIVOLI',
  'Fra Diavolo - Roma Ostiense': 'FDV ROMA OSTIENSE',
  'Fra Diavolo - Torino': 'FDV TORINO IV MARZO',
  'Fra Diavolo - Torino San Salvario': 'FDV TORINO S.SALVARIO',
  'Fra Diavolo - Torino Vanchiglia': 'FDV TORINO VANCHIGLIA',
  'Fra Diavolo - Varese': 'FDV VARESE',
  'Fra Diavolo Bologna': 'FDV BOLOGNA',
  'Fra Diavolo Carlina': 'FDV TORINO CARLINA',
  'Fra Diavolo Novara': 'FDV NOVARA',
  'Fra Diavolo Roma Parioli': 'FDV ROMA PARIOLI',
  'Fra Diavolo- ISOLA': 'FDV MILANO ISOLA',
  'Fra Diavolo - Trastevere': 'FDV ROMA TRASTEVERE',
  'Fra Diavolo - Cagliari': 'FDV CAGLIARI'
};

// ===== COLONNE GLOVO =====
const GLOVO_COL = {
  OPS: {
    WEEK_NUM: 0, STORE_NAME: 1, CITY_CODE: 2, SID: 3, SAID: 4,
    ADDRESS: 5, TOTAL_ORDERS: 6, DELIVERED_ORDERS: 7, TOT_DELIVERY_TIME: 8,
    PREP_TIME: 9, AWTP: 10, WMI: 11, CDTP: 12, UPTIME: 13, RATING: 14
  },
  ORDERS: {
    WEEK_NUM: 0, CITY_CODE: 1, SID: 2, SAID: 3,
    ADDRESS: 4, DELIVERED_ORDERS: 5, GMV: 6
  },
  ADS: {
    STORE: 0, SID: 1, SAID: 2, PLACEMENT: 3, WEEK: 4,
    IMPRESSIONS: 5, CLICKS: 6, CONVERSIONS: 7, TOTAL_ADS: 8,
    ADS_GLOVO: 9, ADS_FDV: 10, GMV: 11, ROAS: 12, CTR: 13
  },
  PROMO: {
    WEEK_NUM: 0, CITY: 1, SAID: 2, ADDRESS: 3,
    PRODUCT_PROMO: 4, DELIVERY_PROMO: 5, TOTAL_SPENT: 6, GLOVO_SPENDING: 7
  }
};

// ===== COLONNE FATTURATO =====
const FATTURATO_COL = {
  DATA: 0, WEEK: 1, CITTA: 2, STORE_ID: 3, NOME: 4,
  LORDO: 5, NETTO: 6, BUDGET: 7, DELTA_BUDGET_PCT: 8,
  NETTO_AP: 9, DELTA_ANNO_PCT: 10, PCT_STORE: 11,
  PCT_ASPORTO: 12, PCT_DELIVEROO: 13, PCT_GLOVO: 14,
  PCT_JUST_EAT: 15, PCT_PRANZO: 16, PCT_CENA: 17, COPERTI: 18
};

// ===== UTILITY FUNCTIONS =====
function parseNumber(val) {
  if (!val) return 0;
  let str = val.toString()
    .replace(/€/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  return parseFloat(str) || 0;
}

function parseItalianNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  let str = String(value).trim();
  str = str.replace(/€/g, '').replace(/%/g, '').trim();
  str = str.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

function parseItalianPercent(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  let str = String(value).trim();
  str = str.replace(/%/g, '').trim();
  str = str.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

function parseInteger(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return Math.round(value);
  const parsed = parseInt(String(value).replace(/[^\d-]/g, ''), 10);
  return isNaN(parsed) ? 0 : parsed;
}

function normalizeStoreName(storeName, platform) {
  if (platform === 'deliveroo') {
    return DELIVEROO_TO_GLOVO_MAPPING[storeName] || storeName;
  }
  return storeName;
}

function getWeekNumberFromDate(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  } catch {
    return null;
  }
}

// ===== CONTROLLER PRINCIPALE =====
export async function getUnifiedData(req, res) {
  try {
    const { week = 'all', city = 'all', store = 'all', view = 'overview' } = req.query;

    console.log(`📊 Unified Request: week=${week}, city=${city}, store=${store}, view=${view}`);

    // Fetch dati da tutte le fonti
    const [glovoData, deliverooData, fatturatoData] = await Promise.all([
      getGlovoSheetsData(),
      getDeliverooSheetsData(),
      getFatturatoSheetsData()
    ]);

    // ========== PROCESSA DATI PER STORE ==========
    const storesData = {};

    // ===== GLOVO DATA =====
    // Process Orders
    glovoData.orders.slice(1).forEach(row => {
      const said = row[GLOVO_COL.ORDERS.SAID];
      const storeInfo = GLOVO_STORE_MAPPING[said];
      if (!storeInfo) return;

      const storeName = storeInfo.name.toUpperCase();
      if (!storesData[storeName]) {
        storesData[storeName] = {
          name: storeName,
          city: storeInfo.city,
          glovo: { gmv: 0, orders: 0, adsSpend: 0, adsGMV: 0, promoSpend: 0, avgUptime: 0, avgRating: 0, avgWMI: 0, avgPrepTime: 0 },
          deliveroo: { gmv: 0, orders: 0, adsSpend: 0, adsGMV: 0, promoSpend: 0, avgUptime: 0, avgRating: 0, avgWMI: 0, avgPrepTime: 0 },
          fatturato: { lordo: 0, netto: 0, budget: 0, deltaBudget: 0, coperti: 0, pctDeliveroo: 0, pctGlovo: 0, pctJustEat: 0, pctStore: 0, pctAsporto: 0 }
        };
      }

      storesData[storeName].glovo.gmv += parseNumber(row[GLOVO_COL.ORDERS.GMV]);
      storesData[storeName].glovo.orders += parseInt(row[GLOVO_COL.ORDERS.DELIVERED_ORDERS]) || 0;
    });

    // Process OPS
    const glovoOpsMap = {};
    glovoData.ops.slice(1).forEach(row => {
      const said = row[GLOVO_COL.OPS.SAID];
      if (!glovoOpsMap[said]) glovoOpsMap[said] = [];
      glovoOpsMap[said].push(row);
    });

    Object.entries(glovoOpsMap).forEach(([said, rows]) => {
      const storeInfo = GLOVO_STORE_MAPPING[said];
      if (!storeInfo) return;

      const storeName = storeInfo.name.toUpperCase();
      const uptimes = rows.map(r => parseNumber(r[GLOVO_COL.OPS.UPTIME])).filter(u => u > 0);
      const ratings = rows.map(r => parseNumber(r[GLOVO_COL.OPS.RATING])).filter(r => r > 0);
      const wmis = rows.map(r => parseNumber(r[GLOVO_COL.OPS.WMI]));
      const prepTimes = rows.map(r => parseNumber(r[GLOVO_COL.OPS.PREP_TIME])).filter(p => p > 0);

      if (storesData[storeName]) {
        storesData[storeName].glovo.avgUptime = uptimes.length > 0 ? uptimes.reduce((a, b) => a + b, 0) / uptimes.length : 0;
        storesData[storeName].glovo.avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length / 20 : 0; // Normalizza 0-5
        storesData[storeName].glovo.avgWMI = wmis.length > 0 ? wmis.reduce((a, b) => a + b, 0) / wmis.length : 0;
        storesData[storeName].glovo.avgPrepTime = prepTimes.length > 0 ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length : 0;
      }
    });

    // Process ADS
    glovoData.ads.slice(1).forEach(row => {
      const said = row[GLOVO_COL.ADS.SAID];
      const storeInfo = GLOVO_STORE_MAPPING[said];
      if (!storeInfo) return;

      const storeName = storeInfo.name.toUpperCase();
      if (storesData[storeName]) {
        storesData[storeName].glovo.adsSpend += parseNumber(row[GLOVO_COL.ADS.ADS_FDV]) + parseNumber(row[GLOVO_COL.ADS.ADS_GLOVO]);
        storesData[storeName].glovo.adsGMV += parseNumber(row[GLOVO_COL.ADS.GMV]);
      }
    });

    // Process PROMO
    glovoData.promo.slice(1).forEach(row => {
      const said = row[GLOVO_COL.PROMO.SAID];
      const storeInfo = GLOVO_STORE_MAPPING[said];
      if (!storeInfo) return;

      const storeName = storeInfo.name.toUpperCase();
      if (storesData[storeName]) {
        storesData[storeName].glovo.promoSpend += parseNumber(row[GLOVO_COL.PROMO.PRODUCT_PROMO]);
      }
    });

    // ===== DELIVEROO DATA =====
    // Process Marketing
    const deliverooMarketingMap = {};
    deliverooData.marketing.forEach(row => {
      const storeName = row.store;
      const normalized = normalizeStoreName(storeName, 'deliveroo').toUpperCase();
      if (!deliverooMarketingMap[normalized]) deliverooMarketingMap[normalized] = [];
      deliverooMarketingMap[normalized].push(row);
    });

    Object.entries(deliverooMarketingMap).forEach(([storeName, rows]) => {
      if (!storesData[storeName]) {
        // Crea entry se non esiste
        storesData[storeName] = {
          name: storeName,
          city: 'Unknown',
          glovo: { gmv: 0, orders: 0, adsSpend: 0, adsGMV: 0, promoSpend: 0, avgUptime: 0, avgRating: 0, avgWMI: 0, avgPrepTime: 0 },
          deliveroo: { gmv: 0, orders: 0, adsSpend: 0, adsGMV: 0, promoSpend: 0, avgUptime: 0, avgRating: 0, avgWMI: 0, avgPrepTime: 0 },
          fatturato: { lordo: 0, netto: 0, budget: 0, deltaBudget: 0, coperti: 0, pctDeliveroo: 0, pctGlovo: 0, pctJustEat: 0, pctStore: 0, pctAsporto: 0 }
        };
      }

      rows.forEach(r => {
        storesData[storeName].deliveroo.gmv += parseItalianNumber(r.gmv);
        storesData[storeName].deliveroo.orders += parseInteger(r.ordini);
        storesData[storeName].deliveroo.adsSpend += parseItalianNumber(r.advertising_cost);
        storesData[storeName].deliveroo.adsGMV += parseItalianNumber(r.vendite_da_adv);
        storesData[storeName].deliveroo.promoSpend += parseItalianNumber(r.sconti);
      });
    });

    // Process OPS
    const deliverooOpsMap = {};
    deliverooData.ops.forEach(row => {
      const storeName = row.store;
      const normalized = normalizeStoreName(storeName, 'deliveroo').toUpperCase();
      if (!deliverooOpsMap[normalized]) deliverooOpsMap[normalized] = [];
      deliverooOpsMap[normalized].push(row);
    });

    Object.entries(deliverooOpsMap).forEach(([storeName, rows]) => {
      if (!storesData[storeName]) return;

      const uptimes = rows.map(r => parseItalianPercent(r.uptime)).filter(u => u > 0);
      const ratings = rows.map(r => parseItalianNumber(r.rating)).filter(r => r > 0);
      const wmis = rows.map(r => parseItalianPercent(r.wmi));
      const prepKey = Object.keys(rows[0] || {}).find(k => k.includes('preparazione') || k.includes('prep'));
      const prepTimes = prepKey ? rows.map(r => parseItalianNumber(r[prepKey])).filter(p => p > 0) : [];

      storesData[storeName].deliveroo.avgUptime = uptimes.length > 0 ? uptimes.reduce((a, b) => a + b, 0) / uptimes.length : 0;
      storesData[storeName].deliveroo.avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      storesData[storeName].deliveroo.avgWMI = wmis.length > 0 ? wmis.reduce((a, b) => a + b, 0) / wmis.length : 0;
      storesData[storeName].deliveroo.avgPrepTime = prepTimes.length > 0 ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length : 0;
    });

    // ===== FATTURATO DATA =====
    const fatturatoMap = {};
    fatturatoData.fatturato.slice(1).forEach(row => {
      const storeName = (row[FATTURATO_COL.NOME] || '').toUpperCase();
      if (!fatturatoMap[storeName]) fatturatoMap[storeName] = [];
      fatturatoMap[storeName].push(row);
    });

    Object.entries(fatturatoMap).forEach(([storeName, rows]) => {
      // Cerca match parziale nel nome
      let targetStore = null;
      for (const key of Object.keys(storesData)) {
        if (key.includes(storeName.split(' ')[1]) || storeName.includes(key.split(' ')[1])) {
          targetStore = key;
          break;
        }
      }

      if (!targetStore && !storesData[storeName]) {
        storesData[storeName] = {
          name: storeName,
          city: rows[0][FATTURATO_COL.CITTA] || 'Unknown',
          glovo: { gmv: 0, orders: 0, adsSpend: 0, adsGMV: 0, promoSpend: 0, avgUptime: 0, avgRating: 0, avgWMI: 0, avgPrepTime: 0 },
          deliveroo: { gmv: 0, orders: 0, adsSpend: 0, adsGMV: 0, promoSpend: 0, avgUptime: 0, avgRating: 0, avgWMI: 0, avgPrepTime: 0 },
          fatturato: { lordo: 0, netto: 0, budget: 0, deltaBudget: 0, coperti: 0, pctDeliveroo: 0, pctGlovo: 0, pctJustEat: 0, pctStore: 0, pctAsporto: 0 }
        };
        targetStore = storeName;
      }

      if (targetStore && storesData[targetStore]) {
        rows.forEach(r => {
          storesData[targetStore].fatturato.lordo += parseNumber(r[FATTURATO_COL.LORDO]);
          storesData[targetStore].fatturato.netto += parseNumber(r[FATTURATO_COL.NETTO]);
          storesData[targetStore].fatturato.budget += parseNumber(r[FATTURATO_COL.BUDGET]);
          storesData[targetStore].fatturato.coperti += parseInteger(r[FATTURATO_COL.COPERTI]);
        });

        // Calcola medie percentuali
        const pctDeliveroo = rows.map(r => parseNumber(r[FATTURATO_COL.PCT_DELIVEROO]));
        const pctGlovo = rows.map(r => parseNumber(r[FATTURATO_COL.PCT_GLOVO]));
        const pctJustEat = rows.map(r => parseNumber(r[FATTURATO_COL.PCT_JUST_EAT]));
        const pctStore = rows.map(r => parseNumber(r[FATTURATO_COL.PCT_STORE]));
        const pctAsporto = rows.map(r => parseNumber(r[FATTURATO_COL.PCT_ASPORTO]));

        storesData[targetStore].fatturato.pctDeliveroo = pctDeliveroo.length > 0 ? pctDeliveroo.reduce((a, b) => a + b, 0) / pctDeliveroo.length : 0;
        storesData[targetStore].fatturato.pctGlovo = pctGlovo.length > 0 ? pctGlovo.reduce((a, b) => a + b, 0) / pctGlovo.length : 0;
        storesData[targetStore].fatturato.pctJustEat = pctJustEat.length > 0 ? pctJustEat.reduce((a, b) => a + b, 0) / pctJustEat.length : 0;
        storesData[targetStore].fatturato.pctStore = pctStore.length > 0 ? pctStore.reduce((a, b) => a + b, 0) / pctStore.length : 0;
        storesData[targetStore].fatturato.pctAsporto = pctAsporto.length > 0 ? pctAsporto.reduce((a, b) => a + b, 0) / pctAsporto.length : 0;

        storesData[targetStore].fatturato.deltaBudget = storesData[targetStore].fatturato.netto - storesData[targetStore].fatturato.budget;
      }
    });

    // ========== CALCOLA TOTALI E METRICHE ==========
    const stores = Object.values(storesData).map(store => ({
      ...store,
      totals: {
        gmv: store.glovo.gmv + store.deliveroo.gmv,
        orders: store.glovo.orders + store.deliveroo.orders,
        adsSpend: store.glovo.adsSpend + store.deliveroo.adsSpend,
        adsGMV: store.glovo.adsGMV + store.deliveroo.adsGMV,
        promoSpend: store.glovo.promoSpend + store.deliveroo.promoSpend,
        roas: (store.glovo.adsSpend + store.deliveroo.adsSpend) > 0
          ? (store.glovo.adsGMV + store.deliveroo.adsGMV) / (store.glovo.adsSpend + store.deliveroo.adsSpend)
          : 0,
        aov: (store.glovo.orders + store.deliveroo.orders) > 0
          ? (store.glovo.gmv + store.deliveroo.gmv) / (store.glovo.orders + store.deliveroo.orders)
          : 0
      }
    })).sort((a, b) => b.totals.gmv - a.totals.gmv);

    // Calcola aggregati globali
    const globalTotals = stores.reduce((acc, store) => {
      acc.gmv += store.totals.gmv;
      acc.orders += store.totals.orders;
      acc.adsSpend += store.totals.adsSpend;
      acc.adsGMV += store.totals.adsGMV;
      acc.promoSpend += store.totals.promoSpend;
      acc.fatturatoNetto += store.fatturato.netto;
      acc.fatturatoLordo += store.fatturato.lordo;
      acc.coperti += store.fatturato.coperti;
      return acc;
    }, {
      gmv: 0,
      orders: 0,
      adsSpend: 0,
      adsGMV: 0,
      promoSpend: 0,
      fatturatoNetto: 0,
      fatturatoLordo: 0,
      coperti: 0
    });

    globalTotals.roas = globalTotals.adsSpend > 0 ? globalTotals.adsGMV / globalTotals.adsSpend : 0;
    globalTotals.aov = globalTotals.orders > 0 ? globalTotals.gmv / globalTotals.orders : 0;

    // ========== RESPONSE ==========
    res.json({
      timestamp: new Date().toISOString(),
      view,
      filters: {
        week,
        city,
        store
      },
      summary: {
        totalStores: stores.length,
        globalTotals
      },
      stores,
      platformComparison: {
        glovo: {
          gmv: stores.reduce((sum, s) => sum + s.glovo.gmv, 0),
          orders: stores.reduce((sum, s) => sum + s.glovo.orders, 0),
          adsSpend: stores.reduce((sum, s) => sum + s.glovo.adsSpend, 0)
        },
        deliveroo: {
          gmv: stores.reduce((sum, s) => sum + s.deliveroo.gmv, 0),
          orders: stores.reduce((sum, s) => sum + s.deliveroo.orders, 0),
          adsSpend: stores.reduce((sum, s) => sum + s.deliveroo.adsSpend, 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in Unified Controller:', error);
    res.status(500).json({ error: error.message });
  }
}

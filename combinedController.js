import { getGlovoSheetsData, getDeliverooSheetsData, getJustEatSheetsData } from './googleSheets.js';

// ===== STORE MAPPING GLOVO =====
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

// ===== DELIVEROO TO GLOVO STORE MAPPING =====
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

// ===== JUST EAT TO FDV STORE MAPPING =====
const JUSTEAT_TO_FDV_MAPPING = {
  'FraDiavolo - Genova Mare': 'FDV GENOVA MARE',
  'FraDiavolo - Genova Castello': 'FDV GENOVA CASTELLO',
  'FraDiavolo': 'FDV RIMINI',
  'FraDiavolo - Rimini': 'FDV RIMINI',
  'FraDiavolo - Milano Bicocca': 'FDV MILANO BICOCCA',
  'FraDiavolo - Milano Citylife': 'FDV MILANO CITYLIFE',
  'FraDiavolo - Milano Isola': 'FDV MILANO ISOLA',
  'FraDiavolo - Milano Premuda': 'FDV MILANO PREMUDA',
  'FraDiavolo - Milano Sempione': 'FDV MILANO SEMPIONE',
  'FraDiavolo - Milano Porta Venezia': 'FDV PORTA VENEZIA',
  'FraDiavolo - Torino GM': 'FDV TORINO GM',
  'FraDiavolo - Torino IV Marzo': 'FDV TORINO IV MARZO',
  'FraDiavolo - Torino Carlina': 'FDV TORINO CARLINA',
  'FraDiavolo - Torino Vanchiglia': 'FDV TORINO VANCHIGLIA',
  'FraDiavolo - Torino S.Salvario': 'FDV TORINO S.SALVARIO',
  'FraDiavolo - Roma Parioli': 'FDV ROMA PARIOLI',
  'FraDiavolo - Roma Ostiense': 'FDV ROMA OSTIENSE',
  'FraDiavolo - Roma Trastevere': 'FDV ROMA TRASTEVERE',
  'FraDiavolo - Bologna': 'FDV BOLOGNA',
  'FraDiavolo - Brescia Centro': 'FDV BRESCIA',
  'FraDiavolo - Brescia': 'FDV BRESCIA',
  'FraDiavolo - Modena': 'FDV MODENA',
  'FraDiavolo - Parma': 'FDV PARMA',
  'FraDiavolo - Monza': 'FDV MONZA',
  'FraDiavolo - Varese': 'FDV VARESE',
  'FraDiavolo - Novara': 'FDV NOVARA',
  'FraDiavolo - Asti': 'FDV ASTI',
  'FraDiavolo - Alessandria': 'FDV ALESSANDRIA',
  'FraDiavolo - Rivoli': 'FDV RIVOLI',
  'FraDiavolo - Casalecchio': 'FDV CASALECCHIO',
  'FraDiavolo - Arese': 'FDV ARESE'
};

// Reverse mapping: da nome normalizzato Glovo a SAID
const GLOVO_NAME_TO_SAID = {};
Object.entries(GLOVO_STORE_MAPPING).forEach(([said, info]) => {
  GLOVO_NAME_TO_SAID[info.name.toUpperCase()] = said;
});

// Normalizza nome Just Eat
function normalizeJustEatStoreName(justEatStoreName) {
  if (JUSTEAT_TO_FDV_MAPPING[justEatStoreName]) {
    return JUSTEAT_TO_FDV_MAPPING[justEatStoreName];
  }
  if (justEatStoreName && justEatStoreName.startsWith('FraDiavolo')) {
    const parts = justEatStoreName.split(' - ');
    if (parts.length > 1) {
      return 'FDV ' + parts.slice(1).join(' ').toUpperCase();
    }
  }
  return null;
}

// ===== COLONNE GLOVO =====
const COL = {
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

function weekNumToISOWeek(num) {
  if (!num) return null;
  const year = new Date().getFullYear();
  return `${year}-W${String(num).padStart(2, '0')}`;
}

function dateToISOWeek(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
    return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  } catch {
    return null;
  }
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

// ===== FUNZIONE DI NORMALIZZAZIONE NOME NEGOZIO DELIVEROO =====
function normalizeDeliverooStoreName(deliverooStoreName) {
  // Converte il nome Deliveroo al nome normalizzato Glovo
  const glovoName = DELIVEROO_TO_GLOVO_MAPPING[deliverooStoreName];
  return glovoName || null;
}

// ===== FUNZIONE PER OTTENERE CITTÀ DA NOME DELIVEROO =====
function getCityFromDeliverooStore(deliverooStoreName) {
  // Prima prova a usare il mapping
  const glovoName = normalizeDeliverooStoreName(deliverooStoreName);
  if (glovoName) {
    // Cerca il SAID corrispondente al nome Glovo
    const said = GLOVO_NAME_TO_SAID[glovoName.toUpperCase()];
    if (said && GLOVO_STORE_MAPPING[said]) {
      return GLOVO_STORE_MAPPING[said].city;
    }
  }

  // Fallback alla funzione di estrazione basata su keyword
  return extractCityFromStoreKeyword(deliverooStoreName);
}

function extractCityFromStore(storeName) {
  // Per negozi Deliveroo (iniziano con "Fra Diavolo")
  if (storeName && storeName.includes('Fra Diavolo')) {
    return getCityFromDeliverooStore(storeName);
  }

  // Fallback per altri negozi
  return extractCityFromStoreKeyword(storeName);
}

function extractCityFromStoreKeyword(storeName) {
  const cityMap = {
    'bicocca': 'Milano', 'city life': 'Milano', 'citylife': 'Milano',
    'navigli': 'Milano', 'porta romana': 'Milano', 'isola': 'Milano',
    'buenos aires': 'Milano', 'loreto': 'Milano', 'sempione': 'Milano',
    'centrale': 'Milano', 'garibaldi': 'Milano', 'brera': 'Milano',
    'tortona': 'Milano', 'paolo sarpi': 'Milano', 'moscova': 'Milano',
    'premuda': 'Milano', 'porta venezia': 'Milano', 'arese': 'Arese',
    'monza': 'Monza',
    'roma': 'Roma', 'trastevere': 'Roma', 'prati': 'Roma',
    'parioli': 'Roma', 'testaccio': 'Roma', 'termini': 'Roma',
    'eur': 'Roma', 'ostiense': 'Roma',
    'torino': 'Torino', 'carlina': 'Torino', 'vanchiglia': 'Torino',
    's.salvario': 'Torino', 'san salvario': 'Torino', 'rivoli': 'Rivoli',
    'iv marzo': 'Torino', 'madre': 'Torino',
    'bologna': 'Bologna', 's.stefano': 'Bologna', 'casalecchio di reno': 'Casalecchio', 'casalecchio': 'Casalecchio',
    'firenze': 'Firenze',
    'napoli': 'Napoli', 'vomero': 'Napoli', 'chiaia': 'Napoli',
    'genova': 'Genova', 'castello': 'Genova', 'mare': 'Genova',
    'brescia': 'Brescia', 'paolo vi': 'Brescia',
    'padova': 'Padova', 'verona': 'Verona', 'parma': 'Parma',
    'modena': 'Modena', 'rimini': 'Rimini', 'novara': 'Novara',
    'varese': 'Varese', 'asti': 'Asti', 'alessandria': 'Alessandria',
    'cagliari': 'Cagliari'
  };
  const lowerName = (storeName || '').toLowerCase();
  for (const [key, city] of Object.entries(cityMap)) {
    if (lowerName.includes(key)) return city;
  }
  return 'Altro';
}

// ===== NORMALIZZAZIONE RATING =====
// Glovo: 0-100 -> 0-5 (diviso 20)
// Deliveroo: 0-5 (già normalizzato)
function normalizeGlovoRating(rating) {
  const r = parseNumber(rating);
  // Se il rating sembra essere in scala 0-100, normalizza
  if (r > 5) {
    return r / 20;
  }
  return r;
}

// ===== CONTROLLER PRINCIPALE =====
export async function getCombinedData(req, res) {
  try {
    // Supporta parametri multipli: week=45,46 o week=2025-W45,2025-W46 o city=Milano,Roma o store=FDV MILANO PREMUDA
    const { week = 'all', city = 'all', store = 'all' } = req.query;

    // Parse weeks (può essere "all", singolo valore, o valori separati da virgola)
    const weekFilters = week === 'all' ? null : week.split(',').map(w => w.trim());
    const cityFilters = city === 'all' ? null : city.split(',').map(c => c.trim());
    const storeFilters = store === 'all' ? null : store.split(',').map(s => s.trim());

    console.log(`📊 Combined Request: weeks=${weekFilters || 'all'}, cities=${cityFilters || 'all'}, stores=${storeFilters || 'all'}`);

    // Fetch dati da tutte le piattaforme
    const [glovoData, deliverooData, justeatData] = await Promise.all([
      getGlovoSheetsData(),
      getDeliverooSheetsData(),
      getJustEatSheetsData()
    ]);

    // ========== GLOVO PROCESSING ==========
    // Estrai numero settimana (es. "2025-W45" -> 45, "45" -> 45)
    const getWeekNum = (weekStr) => {
      if (!weekStr) return null;
      // Prima prova a trovare "W" seguito da numeri
      let match = weekStr.match(/W(\d+)/i);
      if (match) return parseInt(match[1]);
      // Altrimenti prova solo numeri (per input come "46")
      match = weekStr.match(/^(\d+)$/);
      return match ? parseInt(match[1]) : null;
    };

    // Converte i filtri settimane in numeri
    const filterWeekNums = weekFilters ? weekFilters.map(w => getWeekNum(w)).filter(n => n !== null) : null;

    const filterGlovoRow = (row, sheetType) => {
      const saidIndex = COL[sheetType]?.SAID;
      if (saidIndex === undefined) return true;
      const rowSaid = row[saidIndex];
      const storeInfo = GLOVO_STORE_MAPPING[rowSaid];

      // Per ADS, se non c'è filtro città o store, non richiedere store mapping
      if (!storeInfo && (cityFilters && cityFilters.length > 0 || storeFilters && storeFilters.length > 0)) return false;

      // Filtro settimane multiple
      if (filterWeekNums && filterWeekNums.length > 0) {
        let rowWeekNum;
        if (sheetType === 'ADS') {
          const isoWeek = dateToISOWeek(row[COL.ADS.WEEK]);
          rowWeekNum = getWeekNum(isoWeek);
        } else {
          rowWeekNum = parseInt(row[COL[sheetType].WEEK_NUM]) || null;
        }
        if (!filterWeekNums.includes(rowWeekNum)) return false;
      }

      // Filtro città multiple
      if (cityFilters && cityFilters.length > 0 && storeInfo) {
        if (!cityFilters.includes(storeInfo.city)) return false;
      }

      // Filtro store (nome normalizzato Glovo)
      if (storeFilters && storeFilters.length > 0 && storeInfo) {
        const normalizedStoreName = storeInfo.name.toUpperCase();
        const matchesStore = storeFilters.some(filter => normalizedStoreName.includes(filter.toUpperCase()));
        if (!matchesStore) return false;
      }

      return true;
    };

    const glovoOpsFiltered = glovoData.ops.slice(1).filter(r => filterGlovoRow(r, 'OPS'));
    const glovoOrdersFiltered = glovoData.orders.slice(1).filter(r => filterGlovoRow(r, 'ORDERS'));
    const glovoAdsFiltered = glovoData.ads.slice(1).filter(r => filterGlovoRow(r, 'ADS'));
    const glovoPromoFiltered = glovoData.promo.slice(1).filter(r => filterGlovoRow(r, 'PROMO'));

    // KPI Glovo
    const glovoGMV = glovoOrdersFiltered.reduce((sum, r) => sum + parseNumber(r[COL.ORDERS.GMV]), 0);
    const glovoOrders = glovoOrdersFiltered.reduce((sum, r) => sum + (parseInt(r[COL.ORDERS.DELIVERED_ORDERS]) || 0), 0);
    const glovoAOV = glovoOrders > 0 ? glovoGMV / glovoOrders : 0;

    const glovoAdsSpend = glovoAdsFiltered.reduce((sum, r) =>
      sum + parseNumber(r[COL.ADS.ADS_FDV]) + parseNumber(r[COL.ADS.ADS_GLOVO]), 0);
    const glovoAdsGMV = glovoAdsFiltered.reduce((sum, r) => sum + parseNumber(r[COL.ADS.GMV]), 0);
    const glovoROAS = glovoAdsSpend > 0 ? glovoAdsGMV / glovoAdsSpend : 0;

    const glovoPromoSpend = glovoPromoFiltered.reduce((sum, r) =>
      sum + parseNumber(r[COL.PROMO.PRODUCT_PROMO]), 0);

    // Rating Glovo (normalizzato 0-5)
    const glovoRatings = glovoOpsFiltered
      .map(r => normalizeGlovoRating(r[COL.OPS.RATING]))
      .filter(r => r > 0);
    const glovoAvgRating = glovoRatings.length > 0
      ? glovoRatings.reduce((a, b) => a + b, 0) / glovoRatings.length
      : 0;

    // Uptime e WMI Glovo
    const glovoUptimes = glovoOpsFiltered.map(r => parseNumber(r[COL.OPS.UPTIME])).filter(u => u > 0);
    const glovoAvgUptime = glovoUptimes.length > 0 ? glovoUptimes.reduce((a, b) => a + b, 0) / glovoUptimes.length : 0;

    const glovoWMIs = glovoOpsFiltered.map(r => parseNumber(r[COL.OPS.WMI]));
    const glovoAvgWMI = glovoWMIs.length > 0 ? glovoWMIs.reduce((a, b) => a + b, 0) / glovoWMIs.length : 0;

    const glovoPrepTimes = glovoOpsFiltered.map(r => parseNumber(r[COL.OPS.PREP_TIME])).filter(p => p > 0);
    const glovoAvgPrepTime = glovoPrepTimes.length > 0 ? glovoPrepTimes.reduce((a, b) => a + b, 0) / glovoPrepTimes.length : 0;

    // ========== DELIVEROO PROCESSING ==========
    const { marketing, ops } = deliverooData;

    const filterDeliverooMarketing = (row) => {
      const storeCity = extractCityFromStore(row.store || '');
      const normalizedStoreName = normalizeDeliverooStoreName(row.store || '');

      // Filtro settimane multiple
      if (filterWeekNums && filterWeekNums.length > 0) {
        const rowWeekNum = parseInt(row.week) || null;
        if (!filterWeekNums.includes(rowWeekNum)) return false;
      }

      // Filtro città multiple
      if (cityFilters && cityFilters.length > 0) {
        if (!cityFilters.includes(storeCity)) return false;
      }

      // Filtro store (nome normalizzato FDV)
      if (storeFilters && storeFilters.length > 0) {
        if (!normalizedStoreName) return false;
        const matchesStore = storeFilters.some(filter =>
          normalizedStoreName.toUpperCase().includes(filter.toUpperCase())
        );
        if (!matchesStore) return false;
      }

      return true;
    };

    const filterDeliverooOps = (row) => {
      const storeCity = extractCityFromStore(row.store || '');
      const normalizedStoreName = normalizeDeliverooStoreName(row.store || '');

      // Filtro settimane multiple
      if (filterWeekNums && filterWeekNums.length > 0) {
        const rowWeekNum = getWeekNumberFromDate(row.week);
        if (!filterWeekNums.includes(rowWeekNum)) return false;
      }

      // Filtro città multiple
      if (cityFilters && cityFilters.length > 0) {
        if (!cityFilters.includes(storeCity)) return false;
      }

      // Filtro store (nome normalizzato FDV)
      if (storeFilters && storeFilters.length > 0) {
        if (!normalizedStoreName) return false;
        const matchesStore = storeFilters.some(filter =>
          normalizedStoreName.toUpperCase().includes(filter.toUpperCase())
        );
        if (!matchesStore) return false;
      }

      return true;
    };

    const deliverooMarketingFiltered = marketing.filter(filterDeliverooMarketing);
    const deliverooOpsFiltered = ops.filter(filterDeliverooOps);

    // KPI Deliveroo
    const deliverooGMV = deliverooMarketingFiltered.reduce((sum, r) => sum + parseItalianNumber(r.gmv), 0);
    const deliverooOrders = deliverooMarketingFiltered.reduce((sum, r) => sum + parseInteger(r.ordini), 0);
    const deliverooAOV = deliverooOrders > 0 ? deliverooGMV / deliverooOrders : 0;

    const deliverooAdsSpend = deliverooMarketingFiltered.reduce((sum, r) => sum + parseItalianNumber(r.advertising_cost), 0);
    const deliverooAttrSales = deliverooMarketingFiltered.reduce((sum, r) => sum + parseItalianNumber(r.vendite_da_adv), 0);
    const deliverooROAS = deliverooAdsSpend > 0 ? deliverooAttrSales / deliverooAdsSpend : 0;

    const deliverooPromoSpend = deliverooMarketingFiltered.reduce((sum, r) => sum + parseItalianNumber(r.sconti), 0);

    // Rating Deliveroo (già 0-5)
    const deliverooRatings = deliverooOpsFiltered
      .map(r => parseItalianNumber(r.rating))
      .filter(r => r > 0);
    const deliverooAvgRating = deliverooRatings.length > 0
      ? deliverooRatings.reduce((a, b) => a + b, 0) / deliverooRatings.length
      : 0;

    // Uptime e WMI Deliveroo
    const deliverooUptimes = deliverooOpsFiltered.map(r => parseItalianPercent(r.uptime)).filter(u => u > 0);
    const deliverooAvgUptime = deliverooUptimes.length > 0 ? deliverooUptimes.reduce((a, b) => a + b, 0) / deliverooUptimes.length : 0;

    const deliverooWMIs = deliverooOpsFiltered.map(r => parseItalianPercent(r.wmi));
    const deliverooAvgWMI = deliverooWMIs.length > 0 ? deliverooWMIs.reduce((a, b) => a + b, 0) / deliverooWMIs.length : 0;

    const deliverooPrepTimes = deliverooOpsFiltered.map(r => {
      const prepKey = Object.keys(r).find(k => k.includes('preparazione') || k.includes('prep'));
      return prepKey ? parseItalianNumber(r[prepKey]) : 0;
    }).filter(p => p > 0);
    const deliverooAvgPrepTime = deliverooPrepTimes.length > 0 ? deliverooPrepTimes.reduce((a, b) => a + b, 0) / deliverooPrepTimes.length : 0;

    // ========== JUST EAT PROCESSING ==========
    const filterJustEat = (row) => {
      const normalizedStoreName = normalizeJustEatStoreName(row.punto_vendita || '');
      // Usa nome normalizzato per estrarre città (es. "FraDiavolo" → "FDV RIMINI" → "Rimini")
      const storeCity = extractCityFromStoreKeyword(normalizedStoreName || row.punto_vendita || '');

      // Filtro settimane multiple
      if (filterWeekNums && filterWeekNums.length > 0) {
        const rowWeekNum = parseInt(row.week) || null;
        if (!filterWeekNums.includes(rowWeekNum)) return false;
      }

      // Filtro città multiple
      if (cityFilters && cityFilters.length > 0) {
        if (!cityFilters.includes(storeCity)) return false;
      }

      // Filtro store
      if (storeFilters && storeFilters.length > 0) {
        if (!normalizedStoreName) return false;
        const matchesStore = storeFilters.some(filter =>
          normalizedStoreName.toUpperCase().includes(filter.toUpperCase())
        );
        if (!matchesStore) return false;
      }

      return true;
    };

    const justeatFiltered = justeatData.filter(filterJustEat);

    // KPI Just Eat
    const justeatGMV = justeatFiltered.reduce((sum, r) => sum + parseItalianNumber(r.fatturato_netto), 0);
    const justeatOrders = justeatFiltered.reduce((sum, r) => sum + parseInteger(r.ordini), 0);
    const justeatAOV = justeatOrders > 0 ? justeatGMV / justeatOrders : 0;

    const justeatAdsSpend = justeatFiltered.reduce((sum, r) => sum + parseItalianNumber(r.adv), 0);
    const justeatROAS = justeatAdsSpend > 0 ? justeatGMV / justeatAdsSpend : 0;

    const justeatPromoSpend = justeatFiltered.reduce((sum, r) => sum + parseItalianNumber(r.sconti), 0);

    // Rating Just Eat
    const justeatRatings = justeatFiltered.map(r => parseItalianNumber(r.rating)).filter(r => r > 0);
    const justeatAvgRating = justeatRatings.length > 0 ? justeatRatings.reduce((a, b) => a + b, 0) / justeatRatings.length : 0;

    // Uptime Just Eat
    const justeatUptimes = justeatFiltered.map(r => parseItalianPercent(r.uptime)).filter(u => u > 0);
    const justeatAvgUptime = justeatUptimes.length > 0 ? justeatUptimes.reduce((a, b) => a + b, 0) / justeatUptimes.length : 0;

    // WMI Just Eat (VMI nel foglio)
    const justeatWMIs = justeatFiltered.map(r => parseItalianPercent(r.vmi));
    const justeatAvgWMI = justeatWMIs.length > 0 ? justeatWMIs.reduce((a, b) => a + b, 0) / justeatWMIs.length : 0;

    // Tempo consegna Just Eat
    const justeatDeliveryTimes = justeatFiltered.map(r => parseItalianNumber(r.tempo_di_consegna_medio)).filter(t => t > 0);
    const justeatAvgDeliveryTime = justeatDeliveryTimes.length > 0 ? justeatDeliveryTimes.reduce((a, b) => a + b, 0) / justeatDeliveryTimes.length : 0;

    // ========== AGGREGATI TOTALI ==========
    const totalGMV = glovoGMV + deliverooGMV + justeatGMV;
    const totalOrders = glovoOrders + deliverooOrders + justeatOrders;
    const totalAOV = totalOrders > 0 ? totalGMV / totalOrders : 0;

    const totalAdsSpend = glovoAdsSpend + deliverooAdsSpend + justeatAdsSpend;
    const totalAdsGMV = glovoAdsGMV + deliverooAttrSales + justeatGMV; // Just Eat non ha vendite da adv separate
    const totalROAS = totalAdsSpend > 0 ? totalAdsGMV / totalAdsSpend : 0;

    const totalPromoSpend = glovoPromoSpend + deliverooPromoSpend + justeatPromoSpend;

    // Rating medio pesato per ordini
    const totalRatingWeighted = totalOrders > 0
      ? (glovoAvgRating * glovoOrders + deliverooAvgRating * deliverooOrders + justeatAvgRating * justeatOrders) / totalOrders
      : 0;

    // ========== TIME SERIES ==========
    const timeSeriesGlovo = {};
    glovoData.orders.slice(1).forEach(r => {
      const weekNum = r[COL.ORDERS.WEEK_NUM];
      const weekISO = weekNumToISOWeek(weekNum);
      if (!weekISO) return;
      if (!timeSeriesGlovo[weekISO]) timeSeriesGlovo[weekISO] = { gmv: 0, orders: 0 };
      timeSeriesGlovo[weekISO].gmv += parseNumber(r[COL.ORDERS.GMV]);
      timeSeriesGlovo[weekISO].orders += parseInt(r[COL.ORDERS.DELIVERED_ORDERS]) || 0;
    });

    const timeSeriesDeliveroo = {};
    marketing.forEach(r => {
      const weekNum = r.week;
      if (!weekNum) return;
      const weekKey = `2025-W${String(weekNum).padStart(2, '0')}`;
      if (!timeSeriesDeliveroo[weekKey]) timeSeriesDeliveroo[weekKey] = { gmv: 0, orders: 0 };
      timeSeriesDeliveroo[weekKey].gmv += parseItalianNumber(r.gmv);
      timeSeriesDeliveroo[weekKey].orders += parseInteger(r.ordini);
    });

    const timeSeriesJusteat = {};
    justeatData.forEach(r => {
      const weekNum = r.week;
      if (!weekNum) return;
      const weekKey = `2025-W${String(weekNum).padStart(2, '0')}`;
      if (!timeSeriesJusteat[weekKey]) timeSeriesJusteat[weekKey] = { gmv: 0, orders: 0 };
      timeSeriesJusteat[weekKey].gmv += parseItalianNumber(r.fatturato_netto);
      timeSeriesJusteat[weekKey].orders += parseInteger(r.ordini);
    });

    // Unisci time series
    const allWeeks = [...new Set([...Object.keys(timeSeriesGlovo), ...Object.keys(timeSeriesDeliveroo), ...Object.keys(timeSeriesJusteat)])].sort();
    const timeSeries = allWeeks.map(week => ({
      week,
      glovo: timeSeriesGlovo[week] || { gmv: 0, orders: 0 },
      deliveroo: timeSeriesDeliveroo[week] || { gmv: 0, orders: 0 },
      justeat: timeSeriesJusteat[week] || { gmv: 0, orders: 0 },
      total: {
        gmv: (timeSeriesGlovo[week]?.gmv || 0) + (timeSeriesDeliveroo[week]?.gmv || 0) + (timeSeriesJusteat[week]?.gmv || 0),
        orders: (timeSeriesGlovo[week]?.orders || 0) + (timeSeriesDeliveroo[week]?.orders || 0) + (timeSeriesJusteat[week]?.orders || 0)
      }
    }));

    // ========== FILTRI DISPONIBILI ==========
    const weeksSet = new Set();
    glovoData.orders.slice(1).forEach(r => {
      const w = weekNumToISOWeek(r[COL.ORDERS.WEEK_NUM]);
      if (w) weeksSet.add(w);
    });
    marketing.forEach(r => {
      if (r.week) weeksSet.add(`2025-W${String(r.week).padStart(2, '0')}`);
    });

    const citiesSet = new Set();
    const storesSet = new Set();

    // Aggiungi store da Glovo
    Object.values(GLOVO_STORE_MAPPING).forEach(s => {
      citiesSet.add(s.city);
      storesSet.add(s.name.toUpperCase());
    });

    // Aggiungi store da Deliveroo (normalizzati)
    marketing.forEach(r => {
      if (r.store) {
        citiesSet.add(extractCityFromStore(r.store));
        const normalizedName = normalizeDeliverooStoreName(r.store);
        if (normalizedName) storesSet.add(normalizedName.toUpperCase());
      }
    });

    // Aggiungi store da Just Eat
    justeatData.forEach(r => {
      if (r.punto_vendita) {
        if (r.week) weeksSet.add(`2025-W${String(r.week).padStart(2, '0')}`);
        const normalizedName = normalizeJustEatStoreName(r.punto_vendita);
        // Usa nome normalizzato per estrarre città correttamente
        citiesSet.add(extractCityFromStoreKeyword(normalizedName || r.punto_vendita));
        if (normalizedName) storesSet.add(normalizedName.toUpperCase());
      }
    });

    // ========== RESPONSE ==========
    res.json({
      timestamp: new Date().toISOString(),
      filters: {
        weeks: [...weeksSet].sort().reverse(),
        cities: [...citiesSet].sort(),
        stores: [...storesSet].sort()
      },
      // KPI Aggregati
      totals: {
        gmv: totalGMV,
        orders: totalOrders,
        aov: totalAOV,
        adsSpend: totalAdsSpend,
        adsGMV: totalAdsGMV,
        roas: totalROAS,
        promoSpend: totalPromoSpend,
        avgRating: totalRatingWeighted
      },
      // KPI per piattaforma
      glovo: {
        gmv: glovoGMV,
        orders: glovoOrders,
        aov: glovoAOV,
        adsSpend: glovoAdsSpend,
        adsGMV: glovoAdsGMV,
        roas: glovoROAS,
        promoSpend: glovoPromoSpend,
        avgRating: glovoAvgRating,
        avgUptime: glovoAvgUptime,
        avgWMI: glovoAvgWMI,
        avgPrepTime: glovoAvgPrepTime
      },
      deliveroo: {
        gmv: deliverooGMV,
        orders: deliverooOrders,
        aov: deliverooAOV,
        adsSpend: deliverooAdsSpend,
        adsGMV: deliverooAttrSales,
        roas: deliverooROAS,
        promoSpend: deliverooPromoSpend,
        avgRating: deliverooAvgRating,
        avgUptime: deliverooAvgUptime,
        avgWMI: deliverooAvgWMI,
        avgPrepTime: deliverooAvgPrepTime
      },
      justeat: {
        gmv: justeatGMV,
        orders: justeatOrders,
        aov: justeatAOV,
        adsSpend: justeatAdsSpend,
        roas: justeatROAS,
        promoSpend: justeatPromoSpend,
        avgRating: justeatAvgRating,
        avgUptime: justeatAvgUptime,
        avgWMI: justeatAvgWMI,
        avgDeliveryTime: justeatAvgDeliveryTime
      },
      // Time Series
      timeSeries,
      // Confronto side-by-side per grafici
      comparison: {
        gmv: { glovo: glovoGMV, deliveroo: deliverooGMV, justeat: justeatGMV },
        orders: { glovo: glovoOrders, deliveroo: deliverooOrders, justeat: justeatOrders },
        aov: { glovo: glovoAOV, deliveroo: deliverooAOV, justeat: justeatAOV },
        roas: { glovo: glovoROAS, deliveroo: deliverooROAS, justeat: justeatROAS },
        rating: { glovo: glovoAvgRating, deliveroo: deliverooAvgRating, justeat: justeatAvgRating },
        uptime: { glovo: glovoAvgUptime, deliveroo: deliverooAvgUptime, justeat: justeatAvgUptime },
        wmi: { glovo: glovoAvgWMI, deliveroo: deliverooAvgWMI, justeat: justeatAvgWMI },
        prepTime: { glovo: glovoAvgPrepTime, deliveroo: deliverooAvgPrepTime, justeat: justeatAvgDeliveryTime },
        adsSpend: { glovo: glovoAdsSpend, deliveroo: deliverooAdsSpend, justeat: justeatAdsSpend },
        promoSpend: { glovo: glovoPromoSpend, deliveroo: deliverooPromoSpend, justeat: justeatPromoSpend }
      }
    });

  } catch (error) {
    console.error('❌ Error in Combined Controller:', error);
    res.status(500).json({ error: error.message });
  }
}

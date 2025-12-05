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
  'Fra Diavolo (Torino Madre)': 'FDV Torino GM',
  'Fra Diavolo - Alessandria': 'FDV Alessandria',
  'Fra Diavolo - Arese': 'FDV Arese',
  'Fra Diavolo - Asti': 'FDV Asti',
  'Fra Diavolo - Bicocca': 'FDV Milano Bicocca',
  'Fra Diavolo - Brescia': 'FDV Brescia',
  'Fra Diavolo - Brescia Centro': 'FDV Brescia',
  'Fra Diavolo - Casalecchio': 'FDV Casalecchio',
  'Fra Diavolo - City Life': 'FDV Milano Citylife',
  'Fra Diavolo - Genova': 'FDV Genova Castello',
  'Fra Diavolo - Genova Mare': 'FDV Genova Mare',
  'Fra Diavolo - Milano': 'FDV Milano Sempione',
  'Fra Diavolo - Milano Premuda': 'FDV Milano Premuda',
  'Fra Diavolo - Modena': 'FDV Modena',
  'Fra Diavolo - Monza': 'FDV Monza',
  'Fra Diavolo - Parma': 'FDV Parma',
  'Fra Diavolo - Porta Venezia': 'FDV Milano Porta venezia',
  'Fra Diavolo - Rimini': 'FDV Rimini',
  'Fra Diavolo - Rivoli': 'FDV Rivoli',
  'Fra Diavolo - Roma Ostiense': 'FDV Roma ostiense',
  'Fra Diavolo - Torino': 'FDV Torino IV Marzo',
  'Fra Diavolo - Torino San Salvario': 'FDV Torino S.Salvario',
  'Fra Diavolo - Torino Vanchiglia': 'FDV Torino Vanchiglia',
  'Fra Diavolo - Varese': 'FDV Varese',
  'Fra Diavolo Bologna': 'FDV Bologna S.Stefano',
  'Fra Diavolo Carlina': 'FDV Torino Carlina',
  'Fra Diavolo Novara': 'FDV Novara',
  'Fra Diavolo Roma Parioli': 'FDV Roma parioli',
  'Fra Diavolo- ISOLA': 'FDV Milano Isola',
  'Fra Diavolo - Trastevere': 'FDV Roma Trastevere',
  'Fra Diavolo - Cagliari': 'FDV Cagliari'
};

// ===== JUST EAT TO FDV STORE MAPPING =====
const JUSTEAT_TO_FDV_MAPPING = {
  'FraDiavolo - Genova Mare': 'FDV Genova Mare',
  'FraDiavolo - Genova Castello': 'FDV Genova Castello',
  'FraDiavolo': 'FDV Rimini',
  'FraDiavolo - Rimini': 'FDV Rimini',
  'FraDiavolo - Milano Bicocca': 'FDV Milano Bicocca',
  'FraDiavolo - Milano Citylife': 'FDV Milano Citylife',
  'FraDiavolo - Milano Isola': 'FDV Milano Isola',
  'FraDiavolo - Milano Premuda': 'FDV Milano Premuda',
  'FraDiavolo - Milano Sempione': 'FDV Milano Sempione',
  'FraDiavolo - Milano Porta Venezia': 'FDV Milano Porta venezia',
  'FraDiavolo - Torino GM': 'FDV Torino GM',
  'FraDiavolo - Torino IV Marzo': 'FDV Torino IV Marzo',
  'FraDiavolo - Torino Carlina': 'FDV Torino Carlina',
  'FraDiavolo - Torino Vanchiglia': 'FDV Torino Vanchiglia',
  'FraDiavolo - Torino S.Salvario': 'FDV Torino S.Salvario',
  'FraDiavolo - Roma Parioli': 'FDV Roma parioli',
  'FraDiavolo - Roma Ostiense': 'FDV Roma ostiense',
  'FraDiavolo - Roma Trastevere': 'FDV Roma Trastevere',
  'FraDiavolo - Bologna': 'FDV Bologna S.Stefano',
  'FraDiavolo - Brescia Centro': 'FDV Brescia',
  'FraDiavolo - Brescia': 'FDV Brescia',
  'FraDiavolo - Modena': 'FDV Modena',
  'FraDiavolo - Parma': 'FDV Parma',
  'FraDiavolo - Monza': 'FDV Monza',
  'FraDiavolo - Varese': 'FDV Varese',
  'FraDiavolo - Novara': 'FDV Novara',
  'FraDiavolo - Asti': 'FDV Asti',
  'FraDiavolo - Alessandria': 'FDV Alessandria',
  'FraDiavolo - Rivoli': 'FDV Rivoli',
  'FraDiavolo - Casalecchio': 'FDV Casalecchio',
  'FraDiavolo - Arese': 'FDV Arese'
};

function normalizeJustEatStoreName(justEatStoreName) {
  if (JUSTEAT_TO_FDV_MAPPING[justEatStoreName]) {
    return JUSTEAT_TO_FDV_MAPPING[justEatStoreName];
  }
  if (justEatStoreName && justEatStoreName.startsWith('FraDiavolo')) {
    const parts = justEatStoreName.split(' - ');
    if (parts.length > 1) {
      return 'FDV ' + parts.slice(1).join(' ');
    }
  }
  return null;
}

// ===== COLONNE GLOVO =====
const COL = {
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

function dateToWeekNum(dateString) {
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

function normalizeStoreName(name) {
  if (!name) return null;
  // Normalizza al formato "FDV XXX"
  return name.replace(/\s+/g, ' ').trim();
}

function getCityFromStore(storeName) {
  // Cerca nel mapping Glovo
  for (const [said, info] of Object.entries(GLOVO_STORE_MAPPING)) {
    if (info.name.toLowerCase() === storeName.toLowerCase()) {
      return info.city;
    }
  }

  // Fallback per città comuni
  const lowerName = storeName.toLowerCase();
  if (lowerName.includes('milano') || lowerName.includes('bicocca') || lowerName.includes('citylife') || lowerName.includes('isola') || lowerName.includes('premuda') || lowerName.includes('sempione') || lowerName.includes('porta venezia')) return 'Milano';
  if (lowerName.includes('roma') || lowerName.includes('parioli') || lowerName.includes('ostiense') || lowerName.includes('trastevere')) return 'Roma';
  if (lowerName.includes('torino') || lowerName.includes('carlina') || lowerName.includes('vanchiglia') || lowerName.includes('salvario')) return 'Torino';
  if (lowerName.includes('bologna') || lowerName.includes('stefano')) return 'Bologna';
  if (lowerName.includes('genova') || lowerName.includes('castello')) return 'Genova';
  if (lowerName.includes('brescia')) return 'Brescia';
  if (lowerName.includes('monza')) return 'Monza';
  if (lowerName.includes('parma')) return 'Parma';
  if (lowerName.includes('modena')) return 'Modena';
  if (lowerName.includes('rimini')) return 'Rimini';
  if (lowerName.includes('novara')) return 'Novara';
  if (lowerName.includes('varese')) return 'Varese';
  if (lowerName.includes('asti')) return 'Asti';
  if (lowerName.includes('alessandria')) return 'Alessandria';
  if (lowerName.includes('casalecchio')) return 'Casalecchio';
  if (lowerName.includes('rivoli')) return 'Rivoli';
  if (lowerName.includes('arese')) return 'Arese';

  return 'Altro';
}

// ===== CONTROLLER PRINCIPALE =====
export async function getDeliveryReport(req, res) {
  try {
    const { week = 'all', city = 'all', store = 'all' } = req.query;

    // Parse filtri multipli
    const weekFilters = week === 'all' ? null : week.split(',').map(w => w.trim());
    const cityFilters = city === 'all' ? null : city.split(',').map(c => c.trim());
    const storeFilters = store === 'all' ? null : store.split(',').map(s => s.trim());

    console.log(`📋 Delivery Report: weeks=${weekFilters || 'all'}, cities=${cityFilters || 'all'}, stores=${storeFilters || 'all'}`);

    // Fetch dati da tutte le piattaforme
    const [glovoData, deliverooData, justeatData] = await Promise.all([
      getGlovoSheetsData(),
      getDeliverooSheetsData(),
      getJustEatSheetsData()
    ]);

    // Struttura per aggregare: { "week|store": { gmv, ads, sconti per piattaforma } }
    const aggregated = {};

    // ========== GLOVO PROCESSING ==========

    // GMV da Orders
    glovoData.orders.slice(1).forEach(row => {
      const weekNum = parseInt(row[COL.ORDERS.WEEK_NUM]) || null;
      const said = row[COL.ORDERS.SAID];
      const storeInfo = GLOVO_STORE_MAPPING[said];

      if (!weekNum || !storeInfo) return;

      const storeName = storeInfo.name;
      const cityName = storeInfo.city;
      const key = `${weekNum}|${storeName}`;

      if (!aggregated[key]) {
        aggregated[key] = {
          week: weekNum,
          store: storeName,
          city: cityName,
          gmvGlovo: 0,
          gmvDeliveroo: 0,
          gmvJusteat: 0,
          adsGlovo: 0,
          adsDeliveroo: 0,
          adsJusteat: 0,
          scontiGlovo: 0,
          scontiDeliveroo: 0,
          scontiJusteat: 0
        };
      }

      aggregated[key].gmvGlovo += parseNumber(row[COL.ORDERS.GMV]);
    });

    // Ads Glovo (solo ADS_FDV - a carico di Fradiavolo)
    glovoData.ads.slice(1).forEach(row => {
      const weekDate = row[COL.ADS.WEEK];
      const weekNum = dateToWeekNum(weekDate);
      const said = row[COL.ADS.SAID];
      const storeInfo = GLOVO_STORE_MAPPING[said];

      if (!weekNum || !storeInfo) return;

      const storeName = storeInfo.name;
      const cityName = storeInfo.city;
      const key = `${weekNum}|${storeName}`;

      if (!aggregated[key]) {
        aggregated[key] = {
          week: weekNum,
          store: storeName,
          city: cityName,
          gmvGlovo: 0,
          gmvDeliveroo: 0,
          gmvJusteat: 0,
          adsGlovo: 0,
          adsDeliveroo: 0,
          adsJusteat: 0,
          scontiGlovo: 0,
          scontiDeliveroo: 0,
          scontiJusteat: 0
        };
      }

      // Solo ADS_FDV (a carico di Fradiavolo)
      aggregated[key].adsGlovo += parseNumber(row[COL.ADS.ADS_FDV]);
    });

    // Sconti Glovo (PRODUCT_PROMO)
    glovoData.promo.slice(1).forEach(row => {
      const weekNum = parseInt(row[COL.PROMO.WEEK_NUM]) || null;
      const said = row[COL.PROMO.SAID];
      const storeInfo = GLOVO_STORE_MAPPING[said];

      if (!weekNum || !storeInfo) return;

      const storeName = storeInfo.name;
      const cityName = storeInfo.city;
      const key = `${weekNum}|${storeName}`;

      if (!aggregated[key]) {
        aggregated[key] = {
          week: weekNum,
          store: storeName,
          city: cityName,
          gmvGlovo: 0,
          gmvDeliveroo: 0,
          gmvJusteat: 0,
          adsGlovo: 0,
          adsDeliveroo: 0,
          adsJusteat: 0,
          scontiGlovo: 0,
          scontiDeliveroo: 0,
          scontiJusteat: 0
        };
      }

      aggregated[key].scontiGlovo += parseNumber(row[COL.PROMO.PRODUCT_PROMO]);
    });

    // ========== DELIVEROO PROCESSING ==========
    const { marketing } = deliverooData;

    marketing.forEach(row => {
      const weekNum = parseInt(row.week) || null;
      const deliverooStore = row.store;

      if (!weekNum || !deliverooStore) return;

      // Normalizza nome store Deliveroo a nome FDV
      const normalizedName = DELIVEROO_TO_GLOVO_MAPPING[deliverooStore];
      if (!normalizedName) return;

      const storeName = normalizedName;
      const cityName = getCityFromStore(storeName);
      const key = `${weekNum}|${storeName}`;

      if (!aggregated[key]) {
        aggregated[key] = {
          week: weekNum,
          store: storeName,
          city: cityName,
          gmvGlovo: 0,
          gmvDeliveroo: 0,
          gmvJusteat: 0,
          adsGlovo: 0,
          adsDeliveroo: 0,
          adsJusteat: 0,
          scontiGlovo: 0,
          scontiDeliveroo: 0,
          scontiJusteat: 0
        };
      }

      aggregated[key].gmvDeliveroo += parseItalianNumber(row.gmv);
      aggregated[key].adsDeliveroo += parseItalianNumber(row.advertising_cost);
      aggregated[key].scontiDeliveroo += parseItalianNumber(row.sconti);
    });

    // ========== JUST EAT PROCESSING ==========
    justeatData.forEach(row => {
      const weekNum = parseInt(row.week) || null;
      const justeatStore = row.punto_vendita;

      if (!weekNum || !justeatStore) return;

      // Normalizza nome store Just Eat a nome FDV
      const normalizedName = normalizeJustEatStoreName(justeatStore);
      if (!normalizedName) return;

      const storeName = normalizedName;
      const cityName = getCityFromStore(storeName);
      const key = `${weekNum}|${storeName}`;

      if (!aggregated[key]) {
        aggregated[key] = {
          week: weekNum,
          store: storeName,
          city: cityName,
          gmvGlovo: 0,
          gmvDeliveroo: 0,
          gmvJusteat: 0,
          adsGlovo: 0,
          adsDeliveroo: 0,
          adsJusteat: 0,
          scontiGlovo: 0,
          scontiDeliveroo: 0,
          scontiJusteat: 0
        };
      }

      aggregated[key].gmvJusteat += parseItalianNumber(row.fatturato_netto);
      aggregated[key].adsJusteat += parseItalianNumber(row.adv);
      aggregated[key].scontiJusteat += parseItalianNumber(row.sconti);
    });

    // ========== CALCOLA METRICHE FINALI ==========
    let report = Object.values(aggregated).map(row => {
      const gmv = row.gmvGlovo + row.gmvDeliveroo + row.gmvJusteat;
      const ads = row.adsGlovo + row.adsDeliveroo + row.adsJusteat;
      const sconti = row.scontiGlovo + row.scontiDeliveroo + row.scontiJusteat;
      const commissioni = gmv * 0.25; // 25% del GMV

      // % Cost = (Ads + Sconti + Commissioni) / (GMV + Sconti) * 100
      const denominator = gmv + sconti;
      const percentCost = denominator > 0
        ? ((ads + sconti + commissioni) / denominator) * 100
        : 0;

      return {
        week: row.week,
        store: row.store,
        city: row.city,
        gmv,
        gmvGlovo: row.gmvGlovo,
        gmvDeliveroo: row.gmvDeliveroo,
        gmvJusteat: row.gmvJusteat,
        ads,
        adsGlovo: row.adsGlovo,
        adsDeliveroo: row.adsDeliveroo,
        adsJusteat: row.adsJusteat,
        sconti,
        scontiGlovo: row.scontiGlovo,
        scontiDeliveroo: row.scontiDeliveroo,
        scontiJusteat: row.scontiJusteat,
        commissioni,
        percentCost
      };
    });

    // ========== APPLICA FILTRI ==========
    if (weekFilters) {
      report = report.filter(r => weekFilters.includes(String(r.week)));
    }
    if (cityFilters) {
      report = report.filter(r => cityFilters.includes(r.city));
    }
    if (storeFilters) {
      report = report.filter(r => {
        return storeFilters.some(f =>
          r.store.toUpperCase().includes(f.toUpperCase())
        );
      });
    }

    // ========== CALCOLA TOTALI ==========
    const totals = report.reduce((acc, r) => {
      acc.gmv += r.gmv;
      acc.ads += r.ads;
      acc.sconti += r.sconti;
      acc.commissioni += r.commissioni;
      return acc;
    }, { gmv: 0, ads: 0, sconti: 0, commissioni: 0 });

    totals.percentCost = (totals.gmv + totals.sconti) > 0
      ? ((totals.ads + totals.sconti + totals.commissioni) / (totals.gmv + totals.sconti)) * 100
      : 0;

    // ========== FILTRI DISPONIBILI ==========
    const allData = Object.values(aggregated);
    const weeksSet = new Set(allData.map(r => r.week));
    const citiesSet = new Set(allData.map(r => r.city));
    const storesSet = new Set(allData.map(r => r.store));

    // ========== RESPONSE ==========
    res.json({
      timestamp: new Date().toISOString(),
      filters: {
        weeks: [...weeksSet].sort((a, b) => a - b),
        cities: [...citiesSet].sort(),
        stores: [...storesSet].sort()
      },
      totals,
      report: report.sort((a, b) => a.week - b.week || a.store.localeCompare(b.store))
    });

  } catch (error) {
    console.error('❌ Error in Delivery Report Controller:', error);
    res.status(500).json({ error: error.message });
  }
}

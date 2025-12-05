import { getDeliverooSheetsData } from './googleSheets.js';

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

// ✅ Parser per valori in formato italiano (€ 3.651,00 → 3651.00)
function parseItalianNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  
  let str = String(value).trim();
  str = str.replace(/€/g, '').replace(/%/g, '').trim();
  str = str.replace(/\./g, '').replace(',', '.');
  
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

// ✅ Parser per percentuali italiane (93,73% → 93.73)
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

// ✅ Estrai numero settimana da data (2025-01-06 0:00:00 → 2)
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

// ✅ Normalizza nome negozio Deliveroo al formato Glovo
function normalizeDeliverooStoreName(deliverooStoreName) {
  const glovoName = DELIVEROO_TO_GLOVO_MAPPING[deliverooStoreName];
  return glovoName || null;
}

// ✅ Estrai città dal nome store usando il mapping
function extractCityFromStore(storeName) {
  // Prima prova con il mapping esplicito
  const glovoName = normalizeDeliverooStoreName(storeName);
  if (glovoName) {
    // Estrai la città dal nome Glovo normalizzato
    return extractCityFromGlovoName(glovoName);
  }

  // Fallback al metodo basato su keyword
  return extractCityFromStoreKeyword(storeName);
}

// ✅ Estrai città da nome Glovo normalizzato
function extractCityFromGlovoName(glovoName) {
  const cityMap = {
    'ALESSANDRIA': 'Alessandria',
    'ARESE': 'Arese',
    'ASTI': 'Asti',
    'BOLOGNA': 'Bologna',
    'BRESCIA': 'Brescia',
    'CAGLIARI': 'Cagliari',
    'CASALECCHIO': 'Casalecchio',
    'GENOVA': 'Genova',
    'MILANO': 'Milano',
    'MODENA': 'Modena',
    'MONZA': 'Monza',
    'NOVARA': 'Novara',
    'PARMA': 'Parma',
    'PORTA VENEZIA': 'Milano',
    'RIMINI': 'Rimini',
    'RIVOLI': 'Rivoli',
    'ROMA': 'Roma',
    'TORINO': 'Torino',
    'VARESE': 'Varese'
  };

  const upperName = glovoName.toUpperCase();
  for (const [key, city] of Object.entries(cityMap)) {
    if (upperName.includes(key)) {
      return city;
    }
  }
  return 'Altro';
}

// ✅ Estrai città dal nome store usando keyword (fallback)
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
    'bologna': 'Bologna', 's.stefano': 'Bologna', 'casalecchio': 'Casalecchio',
    'firenze': 'Firenze',
    'napoli': 'Napoli', 'vomero': 'Napoli', 'chiaia': 'Napoli',
    'genova': 'Genova', 'castello': 'Genova', 'mare': 'Genova',
    'brescia': 'Brescia', 'paolo vi': 'Brescia',
    'padova': 'Padova', 'verona': 'Verona', 'parma': 'Parma',
    'modena': 'Modena', 'rimini': 'Rimini', 'novara': 'Novara',
    'varese': 'Varese', 'asti': 'Asti', 'alessandria': 'Alessandria',
    'cagliari': 'Cagliari',
    'parigi': 'Parigi', 'paris': 'Parigi', 'lyon': 'Lione', 'lione': 'Lione'
  };

  const lowerName = (storeName || '').toLowerCase();
  for (const [key, city] of Object.entries(cityMap)) {
    if (lowerName.includes(key)) {
      return city;
    }
  }
  return 'Altro';
}

// ✅ Calcola KPI Marketing
function calculateMarketingKPIs(data) {
  const totals = {
    gmv: 0, orders: 0, newCustomers: 0, ordersWithPromo: 0,
    discounts: 0, advertisingCost: 0, attributedSales: 0
  };

  data.forEach(row => {
    totals.gmv += parseItalianNumber(row.gmv);
    totals.orders += parseInteger(row.ordini);
    totals.newCustomers += parseInteger(row.nuovi_clienti);
    totals.ordersWithPromo += parseInteger(row.ordini_promozionati);
    totals.discounts += parseItalianNumber(row.sconti);
    totals.advertisingCost += parseItalianNumber(row.advertising_cost);
    totals.attributedSales += parseItalianNumber(row.vendite_da_adv);
  });

  // % COST = (Commissione + Sconti + Ads) / (GMV + Sconti)
  // Commissione Deliveroo standard = 25% del GMV
  const commissioneDeliveroo = totals.gmv * 0.25;
  const costNumerator = commissioneDeliveroo + totals.discounts + totals.advertisingCost;
  const costDenominator = totals.gmv + totals.discounts;
  const percentCost = costDenominator > 0 ? ((costNumerator / costDenominator) * 100) : 0;

  return {
    ...totals,
    aov: totals.orders > 0 ? totals.gmv / totals.orders : 0,
    roas: totals.advertisingCost > 0 ? totals.attributedSales / totals.advertisingCost : 0,
    promoRate: totals.orders > 0 ? (totals.ordersWithPromo / totals.orders) * 100 : 0,
    newCustomerRate: totals.orders > 0 ? (totals.newCustomers / totals.orders) * 100 : 0,
    percentCost: percentCost.toFixed(2)
  };
}

// ✅ Calcola KPI Operations - NOMI CAMPI CORRETTI PER DELIVEROO
function calculateOpsKPIs(data) {
  let totals = { 
    uptime: 0, rating: 0, rejectionRate: 0, prepTime: 0, 
    orderTime: 0, wait5min: 0, wait10min: 0, wmi: 0 
  };
  let counts = {
    uptime: 0, rating: 0, rejectionRate: 0, prepTime: 0,
    orderTime: 0, wait5min: 0, wait10min: 0, wmi: 0
  };

  data.forEach(row => {
    // Debug: logga le chiavi disponibili (solo primo record)
    if (counts.uptime === 0) {
      console.log('📋 OPS row keys:', Object.keys(row));
    }

    // Uptime (93,73% → 93.73)
    const uptime = parseItalianPercent(row.uptime);
    if (uptime > 0) { totals.uptime += uptime; counts.uptime++; }
    
    // Rating (5,06 → 5.06) - può essere anche "2,0"
    const rating = parseItalianNumber(row.rating);
    if (rating > 0) { totals.rating += rating; counts.rating++; }
    
    // Tasso di rifiuto ordini - cerca la chiave giusta
    const rejectionKey = Object.keys(row).find(k => 
      k.includes('rifiuto') || k.includes('rejection')
    );
    const rejection = rejectionKey ? parseItalianPercent(row[rejectionKey]) : 0;
    totals.rejectionRate += rejection; 
    counts.rejectionRate++;
    
    // Tempo medio di preparazione
    const prepKey = Object.keys(row).find(k => 
      k.includes('preparazione') || k.includes('prep')
    );
    const prepTime = prepKey ? parseItalianNumber(row[prepKey]) : 0;
    if (prepTime > 0) { totals.prepTime += prepTime; counts.prepTime++; }
    
    // Tempo medio ordine
    const orderTimeKey = Object.keys(row).find(k => 
      (k.includes('tempo') && k.includes('ordine') && !k.includes('preparazione')) ||
      k === 'tempo_medio_ordine'
    );
    const orderTime = orderTimeKey ? parseItalianNumber(row[orderTimeKey]) : 0;
    if (orderTime > 0) { totals.orderTime += orderTime; counts.orderTime++; }
    
    // Tasso attesa >5min
    const wait5Key = Object.keys(row).find(k => 
      k.includes('5min') || k.includes('5 min') || k.includes('>5min')
    );
    const wait5min = wait5Key ? parseItalianPercent(row[wait5Key]) : 0;
    totals.wait5min += wait5min; 
    counts.wait5min++;
    
    // Tasso attesa >10min
    const wait10Key = Object.keys(row).find(k => 
      k.includes('10min') || k.includes('10 min') || k.includes('>10min')
    );
    const wait10min = wait10Key ? parseItalianPercent(row[wait10Key]) : 0;
    totals.wait10min += wait10min; 
    counts.wait10min++;
    
    // WMI
    const wmi = parseItalianPercent(row.wmi);
    totals.wmi += wmi; 
    counts.wmi++;
  });

  return {
    avgUptime: counts.uptime > 0 ? totals.uptime / counts.uptime : 0,
    avgRating: counts.rating > 0 ? totals.rating / counts.rating : 0,
    avgRejectionRate: counts.rejectionRate > 0 ? totals.rejectionRate / counts.rejectionRate : 0,
    avgPrepTime: counts.prepTime > 0 ? totals.prepTime / counts.prepTime : 0,
    avgOrderTime: counts.orderTime > 0 ? totals.orderTime / counts.orderTime : 0,
    avgWait5min: counts.wait5min > 0 ? totals.wait5min / counts.wait5min : 0,
    avgWait10min: counts.wait10min > 0 ? totals.wait10min / counts.wait10min : 0,
    avgWMI: counts.wmi > 0 ? totals.wmi / counts.wmi : 0
  };
}

// ✅ Genera Insights automatici - SOGLIE AGGIORNATE
function generateInsights(marketingByStore, opsByStore) {
  const insights = {
    operational: { critical: [], topPerformers: [] },
    marketing: { lowROAS: [], highROAS: [], lowNewCustomers: [] },
    promo: { highPromo: [] }
  };

  // ===== SEGNALAZIONI OPERATIVE =====
  opsByStore.forEach(store => {
    const issues = [];
    
    // Uptime sotto il 90%
    if (store.avgUptime < 90 && store.avgUptime > 0) {
      issues.push({ 
        type: 'UPTIME_BASSO', 
        metric: 'Uptime', 
        value: store.avgUptime.toFixed(1) + '%', 
        threshold: '< 90%',
        message: `Uptime critico (${store.avgUptime.toFixed(1)}%). Verificare disponibilità operativa.`
      });
    }
    
    // Rating sotto il 4
    if (store.avgRating < 4 && store.avgRating > 0) {
      issues.push({ 
        type: 'RATING_BASSO', 
        metric: 'Rating', 
        value: store.avgRating.toFixed(2), 
        threshold: '< 4.0',
        message: `Rating critico (${store.avgRating.toFixed(2)}). Verificare qualità del servizio.`
      });
    }
    
    // WMI alto (manteniamo > 5%)
    if (store.avgWMI > 5) {
      issues.push({ 
        type: 'WMI_ALTO', 
        metric: 'WMI', 
        value: store.avgWMI.toFixed(2) + '%', 
        threshold: '> 5%',
        message: `Troppi ordini errati/mancanti (${store.avgWMI.toFixed(2)}%). Migliorare controllo qualità.`
      });
    }
    
    // Rifiuti alto (manteniamo > 3%)
    if (store.avgRejectionRate > 3) {
      issues.push({ 
        type: 'RIFIUTI_ALTO', 
        metric: 'Rifiuti', 
        value: store.avgRejectionRate.toFixed(2) + '%', 
        threshold: '> 3%',
        message: `Tasso rifiuti elevato (${store.avgRejectionRate.toFixed(2)}%). Verificare capacità operativa.`
      });
    }

    if (issues.length > 0) {
      insights.operational.critical.push({ 
        storeName: store.storeName, 
        city: store.city, 
        issues 
      });
    }

    // Top performers operativi (rating >= 4.8, uptime >= 98, wmi <= 2)
    if (store.avgRating >= 4.8 && store.avgUptime >= 98 && store.avgWMI <= 2) {
      insights.operational.topPerformers.push(store);
    }
  });

  // ===== SEGNALAZIONI MARKETING (ROAS) =====
  marketingByStore.forEach(store => {
    // ROAS basso
    if (store.roas < 2 && store.advertisingCost > 50) {
      insights.marketing.lowROAS.push({
        storeName: store.storeName, 
        city: store.city,
        roas: store.roas, 
        spend: store.advertisingCost, 
        gmv: store.attributedSales,
        message: `ROAS critico (${store.roas.toFixed(2)}x). Spesa: €${Math.round(store.advertisingCost)}, Vendite attr.: €${Math.round(store.attributedSales)}`
      });
    }
    
    // ROAS alto
    if (store.roas >= 5 && store.advertisingCost > 0) {
      insights.marketing.highROAS.push({
        storeName: store.storeName, 
        city: store.city,
        roas: store.roas, 
        spend: store.advertisingCost, 
        gmv: store.attributedSales,
        message: `ROAS eccellente (${store.roas.toFixed(2)}x). Spesa: €${Math.round(store.advertisingCost)}, Vendite attr.: €${Math.round(store.attributedSales)}`
      });
    }
    
    // Nuovi clienti bassi
    if (store.newCustomerRate < 10 && store.orders > 50) {
      insights.marketing.lowNewCustomers.push({
        storeName: store.storeName, 
        city: store.city,
        rate: store.newCustomerRate, 
        orders: store.orders
      });
    }
  });

  // ===== SEGNALAZIONI PROMO (come Glovo: promo / (GMV + promo) > 20%) =====
  marketingByStore.forEach(store => {
    const promo = store.discounts || 0;
    const gmv = store.gmv || 0;
    const denominator = gmv + promo;
    
    // Calcola % promo sul fatturato lordo
    const percentPromo = denominator > 0 ? (promo / denominator) * 100 : 0;
    
    // Segnala se > 20%
    if (percentPromo > 20) {
      insights.promo.highPromo.push({
        storeName: store.storeName, 
        city: store.city,
        percentPromo: percentPromo,
        promo: promo,
        gmv: gmv,
        gmvLordo: denominator,
        message: `% Promo elevata (${percentPromo.toFixed(1)}%). Sconti: €${Math.round(promo)}, GMV: €${Math.round(gmv)}, Fatturato lordo: €${Math.round(denominator)}`
      });
    }
  });

  // Ordina
  insights.marketing.lowROAS.sort((a, b) => a.roas - b.roas);
  insights.marketing.highROAS.sort((a, b) => b.roas - a.roas);
  insights.promo.highPromo.sort((a, b) => b.percentPromo - a.percentPromo);
  insights.operational.topPerformers = insights.operational.topPerformers.slice(0, 5);

  return insights;
}

// ✅ Controller principale
export async function getDeliverooData(req, res) {
  try {
    const { week = 'all', city = 'all', store = 'all' } = req.query;
    console.log(`📊 Deliveroo Request: week=${week}, city=${city}, store=${store}`);

    const { marketing, ops } = await getDeliverooSheetsData();

    console.log('📋 Marketing rows:', marketing.length);
    console.log('📋 OPS rows:', ops.length);
    
    // Debug: mostra primo record OPS
    if (ops.length > 0) {
      console.log('📋 OPS sample row:', ops[0]);
    }

    // ===== ESTRAI FILTRI DISPONIBILI =====
    const weeksSet = new Set();
    const citiesSet = new Set();
    const storesMap = {};

    // Settimane da Marketing (numeri)
    marketing.forEach(row => {
      if (row.week) weeksSet.add(String(row.week));
      if (row.store) {
        const cityName = extractCityFromStore(row.store);
        const normalizedName = normalizeDeliverooStoreName(row.store) || row.store;
        citiesSet.add(cityName);
        storesMap[row.store] = {
          name: row.store,
          normalizedName: normalizedName,
          city: cityName
        };
      }
    });

    // Settimane da OPS (date → converti in numeri)
    ops.forEach(row => {
      const weekNum = getWeekNumberFromDate(row.week);
      if (weekNum) weeksSet.add(String(weekNum));
      if (row.store) {
        const cityName = extractCityFromStore(row.store);
        const normalizedName = normalizeDeliverooStoreName(row.store) || row.store;
        citiesSet.add(cityName);
        storesMap[row.store] = {
          name: row.store,
          normalizedName: normalizedName,
          city: cityName
        };
      }
    });

    const weeks = [...weeksSet].sort((a, b) => parseInt(b) - parseInt(a));
    const cities = [...citiesSet].sort();
    const stores = Object.entries(storesMap).map(([id, info]) => ({
      id,
      name: info.normalizedName, // Mostra il nome FDV
      originalName: info.name,    // Mantieni il nome originale per riferimento
      city: info.city
    })).sort((a, b) => a.name.localeCompare(b.name));

    // ===== FILTRA DATI =====

    // Supporta parametri multipli: week=45,46 o city=Milano,Roma o store=FDV MILANO PREMUDA
    const weekFilters = week === 'all' ? null : week.split(',').map(w => w.trim());
    const cityFilters = city === 'all' ? null : city.split(',').map(c => c.trim());
    const storeFilters = store === 'all' ? null : store.split(',').map(s => s.trim());

    // Filtro per Marketing (week è numero)
    const filterMarketingRow = (row) => {
      const storeCity = extractCityFromStore(row.store || '');
      const normalizedStoreName = normalizeDeliverooStoreName(row.store || '');

      // Filtro settimane multiple
      if (weekFilters && weekFilters.length > 0) {
        if (!weekFilters.includes(String(row.week))) return false;
      }

      // Filtro città multiple
      if (cityFilters && cityFilters.length > 0) {
        if (!cityFilters.includes(storeCity)) return false;
      }

      // Filtro store multiple (nome normalizzato FDV)
      if (storeFilters && storeFilters.length > 0) {
        if (!normalizedStoreName) return false;
        const matchesStore = storeFilters.some(filter =>
          normalizedStoreName.toUpperCase().includes(filter.toUpperCase()) ||
          (row.store || '').toUpperCase().includes(filter.toUpperCase())
        );
        if (!matchesStore) return false;
      }

      return true;
    };

    // Filtro per OPS (week è data)
    const filterOpsRow = (row) => {
      const storeCity = extractCityFromStore(row.store || '');
      const normalizedStoreName = normalizeDeliverooStoreName(row.store || '');

      // Filtro settimane multiple
      if (weekFilters && weekFilters.length > 0) {
        const rowWeek = getWeekNumberFromDate(row.week);
        if (!weekFilters.includes(String(rowWeek))) return false;
      }

      // Filtro città multiple
      if (cityFilters && cityFilters.length > 0) {
        if (!cityFilters.includes(storeCity)) return false;
      }

      // Filtro store multiple (nome normalizzato FDV)
      if (storeFilters && storeFilters.length > 0) {
        if (!normalizedStoreName) return false;
        const matchesStore = storeFilters.some(filter =>
          normalizedStoreName.toUpperCase().includes(filter.toUpperCase()) ||
          (row.store || '').toUpperCase().includes(filter.toUpperCase())
        );
        if (!matchesStore) return false;
      }

      return true;
    };

    const marketingFiltered = marketing.filter(filterMarketingRow);
    const opsFiltered = ops.filter(filterOpsRow);

    console.log('📋 Marketing filtered:', marketingFiltered.length);
    console.log('📋 OPS filtered:', opsFiltered.length);

    // ===== AGGREGA PER STORE - MARKETING =====
    const marketingByStoreMap = {};
    marketingFiltered.forEach(row => {
      const storeName = row.store;
      if (!storeName) return;
      
      if (!marketingByStoreMap[storeName]) {
        marketingByStoreMap[storeName] = [];
      }
      marketingByStoreMap[storeName].push(row);
    });

    const marketingByStore = Object.entries(marketingByStoreMap).map(([storeName, data]) => ({
      storeName: normalizeDeliverooStoreName(storeName) || storeName,
      originalStoreName: storeName,
      city: extractCityFromStore(storeName),
      ...calculateMarketingKPIs(data)
    })).sort((a, b) => b.gmv - a.gmv);

    // ===== AGGREGA PER STORE - OPS =====
    const opsByStoreMap = {};
    opsFiltered.forEach(row => {
      const storeName = row.store;
      if (!storeName) return;
      
      if (!opsByStoreMap[storeName]) {
        opsByStoreMap[storeName] = [];
      }
      opsByStoreMap[storeName].push(row);
    });

    const opsByStore = Object.entries(opsByStoreMap).map(([storeName, data]) => ({
      storeName: normalizeDeliverooStoreName(storeName) || storeName,
      originalStoreName: storeName,
      city: extractCityFromStore(storeName),
      ...calculateOpsKPIs(data)
    })).sort((a, b) => b.avgRating - a.avgRating);

    // ===== AGGREGA PER SETTIMANA - MARKETING =====
    const marketingByWeekMap = {};
    marketingFiltered.forEach(row => {
      const weekNum = row.week;
      if (!weekNum) return;
      
      if (!marketingByWeekMap[weekNum]) {
        marketingByWeekMap[weekNum] = [];
      }
      marketingByWeekMap[weekNum].push(row);
    });

    const marketingByWeek = Object.entries(marketingByWeekMap).map(([weekNum, data]) => ({
      week: weekNum,
      ...calculateMarketingKPIs(data)
    })).sort((a, b) => parseInt(a.week) - parseInt(b.week));

    // ===== AGGREGA PER SETTIMANA - OPS =====
    const opsByWeekMap = {};
    opsFiltered.forEach(row => {
      const weekNum = getWeekNumberFromDate(row.week);
      if (!weekNum) return;
      
      if (!opsByWeekMap[weekNum]) {
        opsByWeekMap[weekNum] = [];
      }
      opsByWeekMap[weekNum].push(row);
    });

    const opsByWeek = Object.entries(opsByWeekMap).map(([weekNum, data]) => ({
      week: weekNum,
      ...calculateOpsKPIs(data)
    })).sort((a, b) => parseInt(a.week) - parseInt(b.week));

    // ===== TIME SERIES PER GRAFICI =====
    const timeSeries = {
      _total: marketingByWeek.map(w => ({ week: `W${w.week}`, gmv: w.gmv, orders: w.orders }))
    };
    
    // Time series per singolo store
    Object.entries(marketingByStoreMap).forEach(([storeName, data]) => {
      const byWeek = {};
      data.forEach(row => {
        const w = row.week;
        if (!byWeek[w]) byWeek[w] = [];
        byWeek[w].push(row);
      });
      
      timeSeries[storeName] = Object.entries(byWeek)
        .map(([w, rows]) => ({
          week: `W${w}`,
          gmv: rows.reduce((sum, r) => sum + parseItalianNumber(r.gmv), 0),
          orders: rows.reduce((sum, r) => sum + parseInteger(r.ordini), 0)
        }))
        .sort((a, b) => a.week.localeCompare(b.week));
    });

    // ===== KPI COMPLESSIVI =====
    const overallMarketing = calculateMarketingKPIs(marketingFiltered);
    const overallOps = calculateOpsKPIs(opsFiltered);

    console.log('📈 Overall Marketing KPIs:', overallMarketing);
    console.log('📈 Overall OPS KPIs:', overallOps);

    // ===== GENERA INSIGHTS =====
    const insights = generateInsights(marketingByStore, opsByStore);

    // ===== RESPONSE =====
    const response = {
      timestamp: new Date().toISOString(),
      filters: { weeks, cities, stores },
      kpis: {
        totalGMV: overallMarketing.gmv,
        totalOrders: overallMarketing.orders,
        aov: overallMarketing.aov,
        newCustomers: overallMarketing.newCustomers,
        newCustomerRate: overallMarketing.newCustomerRate,
        ordersWithPromo: overallMarketing.ordersWithPromo,
        promoRate: overallMarketing.promoRate,
        discounts: overallMarketing.discounts,
        advertisingCost: overallMarketing.advertisingCost,
        attributedSales: overallMarketing.attributedSales,
        roas: overallMarketing.roas,
        percentCost: overallMarketing.percentCost
      },
      ops: {
        avgUptime: overallOps.avgUptime,
        avgRating: overallOps.avgRating,
        avgRejectionRate: overallOps.avgRejectionRate,
        avgPrepTime: overallOps.avgPrepTime,
        avgOrderTime: overallOps.avgOrderTime,
        avgWait5min: overallOps.avgWait5min,
        avgWait10min: overallOps.avgWait10min,
        avgWMI: overallOps.avgWMI,
        byStore: opsByStore,
        byWeek: opsByWeek
      },
      marketing: {
        byStore: marketingByStore,
        byWeek: marketingByWeek
      },
      stores: marketingByStore,
      timeSeries,
      analysis: insights
    };

    console.log('✅ Deliveroo data processed successfully');
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching Deliveroo data:', error);
    res.status(500).json({ error: 'Failed to fetch Deliveroo data', message: error.message });
  }
}
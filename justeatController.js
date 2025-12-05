import { getJustEatSheetsData } from './googleSheets.js';

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

// ✅ Parser per valori in formato italiano (€ 744,70 → 744.70)
function parseItalianNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;

  let str = String(value).trim();
  str = str.replace(/€/g, '').replace(/%/g, '').trim();
  str = str.replace(/\./g, '').replace(',', '.');

  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

// ✅ Parser per percentuali italiane (92,72% → 92.72)
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

// ✅ Normalizza nome negozio Just Eat al formato FDV
function normalizeJustEatStoreName(justEatStoreName) {
  // Prima cerca nel mapping esplicito
  if (JUSTEAT_TO_FDV_MAPPING[justEatStoreName]) {
    return JUSTEAT_TO_FDV_MAPPING[justEatStoreName];
  }

  // Fallback: prova a estrarre il nome dalla struttura "FraDiavolo - XXX"
  if (justEatStoreName && justEatStoreName.startsWith('FraDiavolo')) {
    const parts = justEatStoreName.split(' - ');
    if (parts.length > 1) {
      return 'FDV ' + parts.slice(1).join(' ');
    }
  }

  return null;
}

// ✅ Estrai città dal nome store
function extractCityFromStore(storeName) {
  const cityMap = {
    'genova': 'Genova', 'mare': 'Genova', 'castello': 'Genova',
    'milano': 'Milano', 'bicocca': 'Milano', 'citylife': 'Milano',
    'isola': 'Milano', 'premuda': 'Milano', 'sempione': 'Milano',
    'porta venezia': 'Milano', 'arese': 'Arese', 'monza': 'Monza',
    'roma': 'Roma', 'parioli': 'Roma', 'ostiense': 'Roma', 'trastevere': 'Roma',
    'torino': 'Torino', 'carlina': 'Torino', 'vanchiglia': 'Torino',
    's.salvario': 'Torino', 'san salvario': 'Torino', 'rivoli': 'Rivoli',
    'bologna': 'Bologna', 'casalecchio': 'Casalecchio',
    'brescia': 'Brescia', 'modena': 'Modena', 'parma': 'Parma',
    'rimini': 'Rimini', 'novara': 'Novara', 'varese': 'Varese',
    'asti': 'Asti', 'alessandria': 'Alessandria'
  };

  const lowerName = (storeName || '').toLowerCase();
  for (const [key, city] of Object.entries(cityMap)) {
    if (lowerName.includes(key)) {
      return city;
    }
  }
  return 'Altro';
}

// ✅ Calcola KPI aggregati
function calculateKPIs(data) {
  const totals = {
    gmv: 0, orders: 0, discounts: 0, advertisingCost: 0,
    rejectedOrders: 0, rejectedValue: 0
  };

  let uptimeSum = 0, uptimeCount = 0;
  let ratingSum = 0, ratingCount = 0;
  let deliveryTimeSum = 0, deliveryTimeCount = 0;
  let waitTimeSum = 0, waitTimeCount = 0;
  let wmiSum = 0, wmiCount = 0;

  data.forEach(row => {
    totals.gmv += parseItalianNumber(row.fatturato_netto);
    totals.orders += parseInteger(row.ordini);
    totals.discounts += parseItalianNumber(row.sconti);
    totals.advertisingCost += parseItalianNumber(row.adv);
    totals.rejectedOrders += parseInteger(row.ordini_rifiutati);
    totals.rejectedValue += parseItalianNumber(row.valore_ordini_rifiutati);

    const uptime = parseItalianPercent(row.uptime);
    if (uptime > 0) { uptimeSum += uptime; uptimeCount++; }

    const rating = parseItalianNumber(row.rating);
    if (rating > 0) { ratingSum += rating; ratingCount++; }

    const deliveryTime = parseItalianNumber(row.tempo_di_consegna_medio);
    if (deliveryTime > 0) { deliveryTimeSum += deliveryTime; deliveryTimeCount++; }

    const waitTime = parseItalianNumber(row.tempo_di_attesa_medio);
    if (waitTime > 0) { waitTimeSum += waitTime; waitTimeCount++; }

    const wmi = parseItalianPercent(row.vmi);
    wmiSum += wmi; wmiCount++;
  });

  return {
    ...totals,
    aov: totals.orders > 0 ? totals.gmv / totals.orders : 0,
    roas: totals.advertisingCost > 0 ? totals.gmv / totals.advertisingCost : 0,
    rejectionRate: totals.orders > 0 ? (totals.rejectedOrders / (totals.orders + totals.rejectedOrders)) * 100 : 0,
    avgUptime: uptimeCount > 0 ? uptimeSum / uptimeCount : 0,
    avgRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
    avgDeliveryTime: deliveryTimeCount > 0 ? deliveryTimeSum / deliveryTimeCount : 0,
    avgWaitTime: waitTimeCount > 0 ? waitTimeSum / waitTimeCount : 0,
    avgWMI: wmiCount > 0 ? wmiSum / wmiCount : 0
  };
}

// ✅ Genera Insights automatici
function generateInsights(storeData) {
  const insights = {
    operational: { critical: [], topPerformers: [] },
    marketing: { lowROAS: [], highROAS: [] }
  };

  storeData.forEach(store => {
    const issues = [];

    // Uptime sotto il 90%
    if (store.avgUptime < 90 && store.avgUptime > 0) {
      issues.push({
        type: 'UPTIME_BASSO',
        metric: 'Uptime',
        value: store.avgUptime.toFixed(1) + '%',
        threshold: '< 90%'
      });
    }

    // Rating sotto 4
    if (store.avgRating < 4 && store.avgRating > 0) {
      issues.push({
        type: 'RATING_BASSO',
        metric: 'Rating',
        value: store.avgRating.toFixed(2),
        threshold: '< 4.0'
      });
    }

    // WMI alto
    if (store.avgWMI > 5) {
      issues.push({
        type: 'WMI_ALTO',
        metric: 'WMI',
        value: store.avgWMI.toFixed(2) + '%',
        threshold: '> 5%'
      });
    }

    // Tasso rifiuti alto
    if (store.rejectionRate > 3) {
      issues.push({
        type: 'RIFIUTI_ALTO',
        metric: 'Rifiuti',
        value: store.rejectionRate.toFixed(2) + '%',
        threshold: '> 3%'
      });
    }

    if (issues.length > 0) {
      insights.operational.critical.push({
        storeName: store.storeName,
        city: store.city,
        issues
      });
    }

    // Top performers
    if (store.avgRating >= 4.5 && store.avgUptime >= 95 && store.avgWMI <= 2) {
      insights.operational.topPerformers.push(store);
    }

    // ROAS analysis
    if (store.roas < 2 && store.advertisingCost > 50) {
      insights.marketing.lowROAS.push(store);
    }
    if (store.roas >= 5 && store.advertisingCost > 0) {
      insights.marketing.highROAS.push(store);
    }
  });

  insights.operational.topPerformers = insights.operational.topPerformers.slice(0, 5);
  insights.marketing.lowROAS.sort((a, b) => a.roas - b.roas);
  insights.marketing.highROAS.sort((a, b) => b.roas - a.roas);

  return insights;
}

// ✅ Controller principale
export async function getJustEatData(req, res) {
  try {
    const { week = 'all', city = 'all', store = 'all' } = req.query;
    console.log(`🍔 Just Eat Request: week=${week}, city=${city}, store=${store}`);

    const data = await getJustEatSheetsData();

    console.log('📋 Just Eat rows:', data.length);
    if (data.length > 0) {
      console.log('📋 Just Eat sample row:', data[0]);
    }

    // ===== ESTRAI FILTRI DISPONIBILI =====
    const weeksSet = new Set();
    const citiesSet = new Set();
    const storesMap = {};

    data.forEach(row => {
      if (row.week) weeksSet.add(String(row.week));
      if (row.punto_vendita) {
        const normalizedName = normalizeJustEatStoreName(row.punto_vendita) || row.punto_vendita;
        const cityName = extractCityFromStore(normalizedName);
        citiesSet.add(cityName);
        storesMap[row.punto_vendita] = {
          name: row.punto_vendita,
          normalizedName: normalizedName,
          city: cityName
        };
      }
    });

    const weeks = [...weeksSet].sort((a, b) => parseInt(b) - parseInt(a));
    const cities = [...citiesSet].sort();
    const stores = Object.entries(storesMap).map(([id, info]) => ({
      id,
      name: info.normalizedName,
      originalName: info.name,
      city: info.city
    })).sort((a, b) => a.name.localeCompare(b.name));

    // ===== FILTRA DATI =====
    const weekFilters = week === 'all' ? null : week.split(',').map(w => w.trim());
    const cityFilters = city === 'all' ? null : city.split(',').map(c => c.trim());
    const storeFilters = store === 'all' ? null : store.split(',').map(s => s.trim());

    const filterRow = (row) => {
      const normalizedStoreName = normalizeJustEatStoreName(row.punto_vendita || '');
      // Usa nome normalizzato per estrarre città (es. "FraDiavolo" → "FDV Rimini" → "Rimini")
      const storeCity = extractCityFromStore(normalizedStoreName || row.punto_vendita || '');

      if (weekFilters && weekFilters.length > 0) {
        if (!weekFilters.includes(String(row.week))) return false;
      }

      if (cityFilters && cityFilters.length > 0) {
        if (!cityFilters.includes(storeCity)) return false;
      }

      if (storeFilters && storeFilters.length > 0) {
        if (!normalizedStoreName) return false;
        const matchesStore = storeFilters.some(filter =>
          normalizedStoreName.toUpperCase().includes(filter.toUpperCase()) ||
          (row.punto_vendita || '').toUpperCase().includes(filter.toUpperCase())
        );
        if (!matchesStore) return false;
      }

      return true;
    };

    const filteredData = data.filter(filterRow);
    console.log('📋 Just Eat filtered:', filteredData.length);

    // ===== AGGREGA PER STORE =====
    const byStoreMap = {};
    filteredData.forEach(row => {
      const storeName = row.punto_vendita;
      if (!storeName) return;

      if (!byStoreMap[storeName]) {
        byStoreMap[storeName] = [];
      }
      byStoreMap[storeName].push(row);
    });

    const byStore = Object.entries(byStoreMap).map(([storeName, rows]) => ({
      storeName: normalizeJustEatStoreName(storeName) || storeName,
      originalStoreName: storeName,
      city: extractCityFromStore(storeName),
      ...calculateKPIs(rows)
    })).sort((a, b) => b.gmv - a.gmv);

    // ===== AGGREGA PER SETTIMANA =====
    const byWeekMap = {};
    filteredData.forEach(row => {
      const weekNum = row.week;
      if (!weekNum) return;

      if (!byWeekMap[weekNum]) {
        byWeekMap[weekNum] = [];
      }
      byWeekMap[weekNum].push(row);
    });

    const byWeek = Object.entries(byWeekMap).map(([weekNum, rows]) => ({
      week: weekNum,
      ...calculateKPIs(rows)
    })).sort((a, b) => parseInt(a.week) - parseInt(b.week));

    // ===== TIME SERIES PER GRAFICI =====
    const timeSeries = {
      _total: byWeek.map(w => ({
        week: `W${w.week}`,
        gmv: w.gmv,
        orders: w.orders,
        ads: w.advertisingCost,
        discounts: w.discounts
      }))
    };

    Object.entries(byStoreMap).forEach(([storeName, rows]) => {
      const byWeekStore = {};
      rows.forEach(row => {
        const w = row.week;
        if (!byWeekStore[w]) byWeekStore[w] = [];
        byWeekStore[w].push(row);
      });

      timeSeries[storeName] = Object.entries(byWeekStore)
        .map(([w, weekRows]) => ({
          week: `W${w}`,
          gmv: weekRows.reduce((sum, r) => sum + parseItalianNumber(r.fatturato_netto), 0),
          orders: weekRows.reduce((sum, r) => sum + parseInteger(r.ordini), 0),
          ads: weekRows.reduce((sum, r) => sum + parseItalianNumber(r.adv), 0),
          discounts: weekRows.reduce((sum, r) => sum + parseItalianNumber(r.sconti), 0)
        }))
        .sort((a, b) => a.week.localeCompare(b.week));
    });

    // ===== KPI COMPLESSIVI =====
    const overallKPIs = calculateKPIs(filteredData);

    // ===== GENERA INSIGHTS =====
    const insights = generateInsights(byStore);

    // ===== RESPONSE =====
    const response = {
      timestamp: new Date().toISOString(),
      filters: { weeks, cities, stores },
      kpis: {
        totalGMV: overallKPIs.gmv,
        totalOrders: overallKPIs.orders,
        aov: overallKPIs.aov,
        discounts: overallKPIs.discounts,
        advertisingCost: overallKPIs.advertisingCost,
        roas: overallKPIs.roas,
        rejectedOrders: overallKPIs.rejectedOrders,
        rejectionRate: overallKPIs.rejectionRate
      },
      ops: {
        avgUptime: overallKPIs.avgUptime,
        avgRating: overallKPIs.avgRating,
        avgDeliveryTime: overallKPIs.avgDeliveryTime,
        avgWaitTime: overallKPIs.avgWaitTime,
        avgWMI: overallKPIs.avgWMI,
        byStore,
        byWeek
      },
      stores: byStore,
      timeSeries,
      analysis: insights
    };

    console.log('✅ Just Eat data processed successfully');
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching Just Eat data:', error);
    res.status(500).json({ error: 'Failed to fetch Just Eat data', message: error.message });
  }
}

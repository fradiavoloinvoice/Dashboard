import { getRecensioniSheetsData, getSondaggioSheetsData } from './googleSheets.js';

// Mappa ID → Nome store
const STORE_NAME = {
  '129':'FDV ALESSANDRIA','122':'FDV ARESE','106':'FDV BOLOGNA S.STEFANO','135':'FDV BRESCIA CENTRO',
  '118':'FDV BRESCIA ELNOS','134':'FDV ASTI','136':'FDV TORINO SAN SALVARIO','101':'FDV GENOVA CASTELLO',
  '128':'FDV GENOVA MARE','125':'FDV MILANO BICOCCA','121':'FDV MILANO CITYLIFE','120':'FDV MILANO ISOLA',
  '131':'FDV MILANO PORTA VENEZIA','127':'FDV MILANO PREMUDA','113':'FDV MILANO SEMPIONE','132':'FDV MODENA',
  '126':'FDV MONZA','112':'FDV NOVARA','124':'FDV PARMA','137':'FDV RIMINI','202':'FDV RIVOLI',
  '133':'FDV ROMA OSTIENSE','107':'FDV ROMA PARIOLI','138':'FDV ROMA TRASTEVERE','114':'FDV TORINO CARLINA',
  '117':'FDV TORINO GM','123':'FDV TORINO IV MARZO','201':'FDV TORINO SAN SALVARIO','130':'FDV TORINO VANCHIGLIA',
  '119':'FDV VARESE','10001':'FDV CASELECCHIO DI RENO','301':'FDV CAGLIARI'
};

function mapStore(v) {
  const s = String(v ?? '').trim();
  return STORE_NAME[s] || s;
}

function normalizeStoreName(name) {
  if (!name) return '';
  return name.toUpperCase()
    .replace(/FRA DIAVOLO /gi, 'FDV ')
    .replace(/FRADIAVOLO /gi, 'FDV ')
    .replace(/\s+/g, ' ')
    .trim();
}

function storesMatch(name1, name2) {
  const n1 = normalizeStoreName(name1);
  const n2 = normalizeStoreName(name2);
  if (n1 === n2) return true;
  // Match parziale (es. "MILANO BICOCCA" in "FDV MILANO BICOCCA")
  const short1 = n1.replace('FDV ', '');
  const short2 = n2.replace('FDV ', '');
  return short1.includes(short2) || short2.includes(short1);
}

/**
 * GET /api/recensioni
 * Restituisce i dati delle recensioni piattaforme (Glovo, Deliveroo, etc.)
 */
export async function getRecensioniData(req, res) {
  try {
    console.log('📥 /api/recensioni called');

    const rawData = await getRecensioniSheetsData();

    // Filtra righe vuote
    const data = rawData.filter(row => {
      return Object.values(row).some(val => val && String(val).trim() !== '');
    });

    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('❌ Error in getRecensioniData:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/sondaggio
 * Restituisce i dati del sondaggio
 */
export async function getSondaggioData(req, res) {
  try {
    console.log('📥 /api/sondaggio called');

    const rawData = await getSondaggioSheetsData();

    // Filtra righe vuote
    const data = rawData.filter(row => {
      return Object.values(row).some(val => val && String(val).trim() !== '');
    });

    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('❌ Error in getSondaggioData:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Helper: calcola ISO week/year da una data
 */
function isoWeekYear(dateVal) {
  let d;
  if (typeof dateVal === 'number') {
    d = new Date((dateVal - 25569) * 86400 * 1000);
  } else if (typeof dateVal === 'string' && dateVal.includes('/')) {
    const parts = dateVal.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      d = new Date(year, month, day);
    } else {
      d = new Date(dateVal);
    }
  } else {
    d = new Date(dateVal);
  }

  if (isNaN(d)) return { week: null, year: null };

  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7;
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
  const isoYear = tmp.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const week = 1 + Math.round(((tmp - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return { week, year: isoYear };
}

/**
 * Helper: estrae anno da data in formato DD/MM/YYYY o YYYY-MM-DD
 */
function getYearFromDate(dateVal) {
  if (!dateVal) return null;
  const str = String(dateVal);
  if (str.includes('/')) {
    // DD/MM/YYYY
    const parts = str.split('/');
    return parts.length === 3 ? parseInt(parts[2], 10) : null;
  } else if (str.includes('-')) {
    // YYYY-MM-DD
    return parseInt(str.split('-')[0], 10);
  }
  return null;
}

/**
 * GET /api/recensioni/store/:storeName
 * Restituisce dati aggregati delle recensioni per uno specifico store
 */
export async function getRecensioniByStore(req, res) {
  try {
    const { storeName } = req.params;
    const { weekFrom, weekTo } = req.query;

    console.log(`📥 /api/recensioni/store/${storeName} called (weeks: ${weekFrom}-${weekTo})`);

    const [recensioniRaw, sondaggioRaw] = await Promise.all([
      getRecensioniSheetsData(),
      getSondaggioSheetsData()
    ]);

    // ===== PIATTAFORME (Foglio 1) =====
    // punto_vendita contiene già il nome (es. "FDV TORINO SAN SALVARIO")
    // sourcefrom è la piattaforma (es. "GoogleMyBusiness", "TheFork")
    // voto è il voto (1-5)
    const piattaforme = recensioniRaw
      .filter(row => Object.values(row).some(val => val && String(val).trim() !== ''))
      .map(r => {
        const store = r.punto_vendita || r['punto vendita'] || r.store || '';
        const rawDate = r.data || r.date || '';
        const { week, year } = isoWeekYear(rawDate);
        const sourceFrom = r.sourcefrom || r.source || '';
        const voto = parseInt(r.voto || r.rating || 0);
        return { store, sourceFrom, voto, week, year, testo: r.testo || r.text || '' };
      })
      .filter(r => r.store && r.voto > 0 && storesMatch(r.store, storeName));

    // Filtra per settimane se specificato
    let piattaformeFiltrate = piattaforme;
    if (weekFrom && weekTo) {
      const wFrom = parseInt(weekFrom);
      const wTo = parseInt(weekTo);
      piattaformeFiltrate = piattaforme.filter(r => r.week >= wFrom && r.week <= wTo);
    }

    // Aggrega per piattaforma
    const byPlatform = {};
    piattaformeFiltrate.forEach(r => {
      const platform = r.sourceFrom.toLowerCase();
      if (!byPlatform[platform]) byPlatform[platform] = { count: 0, sum: 0, reviews: [] };
      byPlatform[platform].count++;
      byPlatform[platform].sum += r.voto;
      if (r.testo) byPlatform[platform].reviews.push({ voto: r.voto, testo: r.testo });
    });

    // Calcola medie per piattaforma
    const platformStats = {};
    for (const [platform, data] of Object.entries(byPlatform)) {
      platformStats[platform] = {
        count: data.count,
        avgRating: data.count > 0 ? (data.sum / data.count).toFixed(2) : 0,
        latestReviews: data.reviews.slice(-3)
      };
    }

    // Totale piattaforme
    const totalPiattaforme = piattaformeFiltrate.length;
    const avgPiattaforme = totalPiattaforme > 0
      ? (piattaformeFiltrate.reduce((s, r) => s + r.voto, 0) / totalPiattaforme).toFixed(2)
      : 0;

    // ===== SONDAGGIO (Foglio 2) - NPS =====
    // store_id è l'ID numerico che va mappato
    // probabilità (colonna N) è il voto NPS (0-10)
    // Filtra SOLO anno 2025
    // NPS: 9-10 = promotori, 0-6 = detrattori, 7-8 = neutri
    const sondaggio = sondaggioRaw
      .filter(row => Object.values(row).some(val => val && String(val).trim() !== ''))
      .map(r => {
        const storeId = r.store_id || r.storeid || '';
        const mappedStore = mapStore(storeId);
        // Colonna "probabilità" per NPS
        const nps = r.probabilità !== undefined ? parseInt(r.probabilità) : null;
        // Data per filtrare anno
        const rawDate = r.data || r.date || '';
        const year = getYearFromDate(rawDate);
        const { week } = isoWeekYear(rawDate);
        return { store: mappedStore, storeId, nps, week, year };
      })
      // Filtra: solo 2025, NPS valido, store corrispondente
      .filter(r => r.store && r.nps !== null && !isNaN(r.nps) && r.year === 2025 && storesMatch(r.store, storeName));

    // Filtra per settimane se specificato
    let sondaggioFiltrato = sondaggio;
    if (weekFrom && weekTo) {
      const wFrom = parseInt(weekFrom);
      const wTo = parseInt(weekTo);
      sondaggioFiltrato = sondaggio.filter(r => r.week >= wFrom && r.week <= wTo);
    }

    // Calcola NPS: promotori (9-10), detrattori (0-6), neutri (7-8)
    const promoters = sondaggioFiltrato.filter(r => r.nps >= 9 && r.nps <= 10).length;
    const detractors = sondaggioFiltrato.filter(r => r.nps >= 0 && r.nps <= 6).length;
    const neutrals = sondaggioFiltrato.filter(r => r.nps >= 7 && r.nps <= 8).length;
    const totalNps = sondaggioFiltrato.length;

    // NPS = % promotori - % detrattori
    const npsScore = totalNps > 0
      ? Math.round(((promoters / totalNps) * 100) - ((detractors / totalNps) * 100))
      : null;

    // ===== GARA GOOGLE (dalla W44) =====
    // Solo recensioni con sourcefrom = "googlemybusiness" (case insensitive)
    const googleReviews = piattaforme
      .filter(r => r.sourceFrom.toLowerCase() === 'googlemybusiness' && r.week >= 44);

    const googleCount = googleReviews.length;
    const googleAvg = googleCount > 0
      ? (googleReviews.reduce((s, r) => s + r.voto, 0) / googleCount).toFixed(2)
      : 0;

    res.json({
      success: true,
      store: storeName,
      piattaforme: {
        total: totalPiattaforme,
        avgRating: parseFloat(avgPiattaforme),
        byPlatform: platformStats
      },
      sondaggio: {
        total: totalNps,
        npsScore,
        promoters,
        detractors,
        neutrals
      },
      garaGoogle: {
        count: googleCount,
        avgRating: parseFloat(googleAvg),
        fromWeek: 44
      }
    });
  } catch (error) {
    console.error('❌ Error in getRecensioniByStore:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/nps-ranking
 * Restituisce classifica NPS di tutti gli store (anno 2025)
 */
export async function getNpsRanking(req, res) {
  try {
    console.log('📥 /api/nps-ranking called');

    const sondaggioRaw = await getSondaggioSheetsData();

    // Raggruppa per store
    const storeData = {};

    sondaggioRaw
      .filter(row => Object.values(row).some(val => val && String(val).trim() !== ''))
      .forEach(r => {
        const storeId = r.store_id || r.storeid || '';
        const mappedStore = mapStore(storeId);
        const nps = r.probabilità !== undefined ? parseInt(r.probabilità) : null;
        const rawDate = r.data || r.date || '';
        const year = getYearFromDate(rawDate);

        // Solo 2025 e NPS valido
        if (!mappedStore || nps === null || isNaN(nps) || year !== 2025) return;

        if (!storeData[mappedStore]) {
          storeData[mappedStore] = { promoters: 0, detractors: 0, neutrals: 0, total: 0 };
        }

        storeData[mappedStore].total++;
        if (nps >= 9 && nps <= 10) storeData[mappedStore].promoters++;
        else if (nps >= 0 && nps <= 6) storeData[mappedStore].detractors++;
        else if (nps >= 7 && nps <= 8) storeData[mappedStore].neutrals++;
      });

    // Calcola NPS score per ogni store
    const ranking = Object.entries(storeData)
      .map(([store, data]) => ({
        store,
        npsScore: data.total > 0
          ? Math.round(((data.promoters / data.total) * 100) - ((data.detractors / data.total) * 100))
          : null,
        promoters: data.promoters,
        detractors: data.detractors,
        neutrals: data.neutrals,
        total: data.total
      }))
      .filter(s => s.npsScore !== null)
      .sort((a, b) => b.npsScore - a.npsScore);

    res.json({
      success: true,
      count: ranking.length,
      ranking
    });
  } catch (error) {
    console.error('❌ Error in getNpsRanking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/underperforming
 * Restituisce store sotto-performanti (delta budget < -10% o NPS negativo)
 */
export async function getUnderperformingStores(req, res) {
  try {
    console.log('📥 /api/underperforming called');

    // Importa dati fatturato
    const { getFatturatoSheetsData } = await import('./googleSheets.js');
    const [fatturatoData, sondaggioRaw] = await Promise.all([
      getFatturatoSheetsData(),
      getSondaggioSheetsData()
    ]);

    // Estrai array di righe dal fatturato (formato: { fatturato: [[row], [row], ...] })
    const fatturatoRows = fatturatoData.fatturato || [];
    // Converti a oggetti se necessario (prima riga = header)
    let fatturatoRaw = [];
    if (fatturatoRows.length > 1) {
      const headers = fatturatoRows[0];
      fatturatoRaw = fatturatoRows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });
    }

    // Calcola NPS per store (2025)
    const npsData = {};
    sondaggioRaw
      .filter(row => Object.values(row).some(val => val && String(val).trim() !== ''))
      .forEach(r => {
        const storeId = r.store_id || r.storeid || '';
        const mappedStore = mapStore(storeId);
        const nps = r.probabilità !== undefined ? parseInt(r.probabilità) : null;
        const year = getYearFromDate(r.data || r.date || '');

        if (!mappedStore || nps === null || isNaN(nps) || year !== 2025) return;

        if (!npsData[mappedStore]) {
          npsData[mappedStore] = { promoters: 0, detractors: 0, total: 0 };
        }
        npsData[mappedStore].total++;
        if (nps >= 9 && nps <= 10) npsData[mappedStore].promoters++;
        else if (nps >= 0 && nps <= 6) npsData[mappedStore].detractors++;
      });

    // Calcola delta budget per store
    const budgetData = {};
    fatturatoRaw.forEach(r => {
      const store = r.store || r.punto_vendita || r['PUNTO VENDITA'] || '';
      const fatturato = parseFloat(r.fatturato || r.netto || r['NETTO'] || 0);
      const budget = parseFloat(r.budget || r['BUDGET'] || 0);

      if (!store || budget === 0) return;

      // Normalizza nome store
      const normalizedStore = store.toUpperCase().replace(/FRA DIAVOLO /gi, 'FDV ').trim();

      if (!budgetData[normalizedStore]) {
        budgetData[normalizedStore] = { fatturato: 0, budget: 0 };
      }
      budgetData[normalizedStore].fatturato += fatturato;
      budgetData[normalizedStore].budget += budget;
    });

    // Identifica store sotto-performanti
    const alerts = [];
    const allStores = new Set([...Object.keys(npsData), ...Object.keys(budgetData)]);

    allStores.forEach(store => {
      const issues = [];
      let deltaBudget = null;
      let npsScore = null;

      // Check delta budget
      if (budgetData[store]) {
        const { fatturato, budget } = budgetData[store];
        deltaBudget = ((fatturato - budget) / budget) * 100;
        if (deltaBudget < -10) {
          issues.push(`Delta Budget: ${deltaBudget.toFixed(1)}%`);
        }
      }

      // Check NPS
      if (npsData[store] && npsData[store].total > 0) {
        const { promoters, detractors, total } = npsData[store];
        npsScore = Math.round(((promoters / total) * 100) - ((detractors / total) * 100));
        if (npsScore < 0) {
          issues.push(`NPS: ${npsScore}`);
        }
      }

      if (issues.length > 0) {
        alerts.push({
          store,
          issues,
          deltaBudget: deltaBudget !== null ? parseFloat(deltaBudget.toFixed(1)) : null,
          npsScore
        });
      }
    });

    // Ordina per gravità (più problemi = più grave)
    alerts.sort((a, b) => b.issues.length - a.issues.length || (a.deltaBudget || 0) - (b.deltaBudget || 0));

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('❌ Error in getUnderperformingStores:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/delivery-comparison
 * Confronto performance Glovo vs Deliveroo per tutti gli store
 */
export async function getDeliveryComparison(req, res) {
  try {
    console.log('📥 /api/delivery-comparison called');

    const { getGlovoSheetsData, getDeliverooSheetsData } = await import('./googleSheets.js');
    const [glovoSheets, deliverooSheets] = await Promise.all([
      getGlovoSheetsData(),
      getDeliverooSheetsData()
    ]);

    // Glovo: usa il foglio ORDERS (formato raw: array di array)
    const glovoOrdersRows = glovoSheets.orders || [];
    let glovoOrders = [];
    if (glovoOrdersRows.length > 1) {
      const headers = glovoOrdersRows[0];
      if (Array.isArray(headers)) {
        glovoOrders = glovoOrdersRows.slice(1).map(row => {
          const obj = {};
          headers.forEach((h, i) => { obj[h] = row[i]; });
          return obj;
        });
      }
    }

    // Deliveroo: usa il foglio ops (OPS DELIVEROO) - già convertito da rowsToObjects()
    const deliverooOps = deliverooSheets.ops || [];

    // Aggrega dati Glovo per store
    const glovoData = {};
    glovoOrders.forEach(r => {
      // Glovo ORDERS: Store Name, Total Orders, Subtotal (GMV)
      const store = r['Store Name'] || r.store || r.punto_vendita || '';
      const orders = parseInt(r['Total Orders'] || r.orders || r.ordini || 0);
      const revenue = parseFloat(r['Subtotal (GMV)'] || r.revenue || r.fatturato || 0);

      if (!store) return;

      const normalizedStore = store.toUpperCase().trim();
      if (!glovoData[normalizedStore]) {
        glovoData[normalizedStore] = { orders: 0, revenue: 0 };
      }
      glovoData[normalizedStore].orders += orders;
      glovoData[normalizedStore].revenue += revenue;
    });

    // Aggrega dati Deliveroo per store
    const deliverooData = {};
    deliverooOps.forEach(r => {
      // Deliveroo OPS: STORE, NUM. ORDINI, TOTALE NETTO
      const store = r['STORE'] || r.store || r.punto_vendita || '';
      const orders = parseInt(r['NUM. ORDINI'] || r.orders || r.ordini || 0);
      const revenue = parseFloat(r['TOTALE NETTO'] || r.revenue || r.fatturato || 0);

      if (!store) return;

      const normalizedStore = store.toUpperCase().replace(/FRA DIAVOLO /gi, 'FDV ').trim();
      if (!deliverooData[normalizedStore]) {
        deliverooData[normalizedStore] = { orders: 0, revenue: 0 };
      }
      deliverooData[normalizedStore].orders += orders;
      deliverooData[normalizedStore].revenue += revenue;
    });

    // Combina dati
    const allStores = new Set([...Object.keys(glovoData), ...Object.keys(deliverooData)]);
    const comparison = [];

    allStores.forEach(store => {
      const glovo = glovoData[store] || { orders: 0, revenue: 0 };
      const deliveroo = deliverooData[store] || { orders: 0, revenue: 0 };

      comparison.push({
        store,
        glovo: {
          orders: glovo.orders,
          revenue: parseFloat(glovo.revenue.toFixed(2))
        },
        deliveroo: {
          orders: deliveroo.orders,
          revenue: parseFloat(deliveroo.revenue.toFixed(2))
        },
        total: {
          orders: glovo.orders + deliveroo.orders,
          revenue: parseFloat((glovo.revenue + deliveroo.revenue).toFixed(2))
        },
        glovoShare: glovo.orders + deliveroo.orders > 0
          ? parseFloat(((glovo.orders / (glovo.orders + deliveroo.orders)) * 100).toFixed(1))
          : 0
      });
    });

    comparison.sort((a, b) => b.total.revenue - a.total.revenue);

    res.json({
      success: true,
      count: comparison.length,
      comparison
    });
  } catch (error) {
    console.error('❌ Error in getDeliveryComparison:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

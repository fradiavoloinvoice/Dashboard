import { getFatturatoSheetsData } from './googleSheets.js';

// ✅ INDICI COLONNE
const COL = {
  DATA: 0,           // A - Data (DD/MM/YYYY)
  WEEK: 1,           // B - Week (ISO week)
  CITTA: 2,          // C - Città
  STORE_ID: 3,       // D - Store ID (ignoriamo)
  NOME: 4,           // E - Nome ristorante
  LORDO: 5,          // F - Fatturato lordo
  NETTO: 6,          // G - Fatturato netto
  BUDGET: 7,         // H - Fatturato budget
  DELTA_BUDGET_PCT: 8,    // I - % delta netto su budget (già %)
  NETTO_AP: 9,       // J - Fatturato netto anno precedente
  DELTA_ANNO_PCT: 10,     // K - % delta anno su anno (già %)
  PCT_STORE: 11,     // L - % Store
  PCT_ASPORTO: 12,   // M - % Asporto
  PCT_DELIVEROO: 13, // N - % Deliveroo
  PCT_GLOVO: 14,     // O - % Glovo
  PCT_JUST_EAT: 15,  // P - % Just Eat
  PCT_PRANZO: 16,    // Q - % Pranzo
  PCT_CENA: 17,      // R - % Cena
  COPERTI: 18        // S - Numero coperti
};

function parseNumber(val) {
  if (!val || val === 'NaN' || val === '') return 0;
  
  if (typeof val === 'number') return val;
  
  let str = val.toString().trim();
  
  // Rimuovi simbolo € e spazi
  str = str.replace(/€/g, '').replace(/\s/g, '');
  
  // FORMATO ITALIANO: punto = migliaia, virgola = decimali
  // Esempi: "1.340,02" o "1.240" o "5.556"
  
  // Se contiene sia punto che virgola → formato italiano completo
  if (str.includes('.') && str.includes(',')) {
    // "1.340,02" → rimuovi punto, sostituisci virgola con punto → "1340.02"
    str = str.replace(/\./g, '').replace(',', '.');
  }
  // Se contiene solo la virgola → formato italiano solo decimali
  else if (str.includes(',')) {
    // "340,02" → sostituisci virgola con punto → "340.02"
    str = str.replace(',', '.');
  }
  // Se contiene solo il punto → è separatore migliaia
  else if (str.includes('.')) {
    // "1.240" → rimuovi punto → "1240"
    str = str.replace(/\./g, '');
  }
  // Altrimenti è già un numero semplice: "1240" o "340"
  
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function formatDate(dateStr) {
  try {
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.split('T')[0];
    }
    
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateStr;
  } catch {
    return dateStr;
  }
}

export async function getFatturatoData(req, res) {
  try {
    const {
      dateFilter = 'all',
      weeks = '',
      city = 'all',
      store = 'all',
      period = 'daily',
      dateFrom = '',
      dateTo = '',
      weekFrom = '',
      weekTo = ''
    } = req.query;
    const data = await getFatturatoSheetsData();
    const rows = data.fatturato.slice(1); // Skip header

    console.log(`📊 Fatturato Request: dateFilter=${dateFilter}, weeks=${weeks}, city=${city}, store=${store}, period=${period}, dateFrom=${dateFrom}, dateTo=${dateTo}, weekFrom=${weekFrom}, weekTo=${weekTo}`);

    // ✅ FILTRA BASANDOTI SULLA DATA, non sulla settimana
    const filteredRows = rows.filter(row => {
      const rowCity = row[COL.CITTA];
      const rowStoreName = row[COL.NOME];
      const rowDateStr = formatDate(row[COL.DATA]);
      const rowDate = new Date(rowDateStr);
      const rowWeek = parseInt(row[COL.WEEK]) || 0;

      // Filtro città e store
      if (city !== 'all' && rowCity !== city) return false;
      if (store !== 'all' && rowStoreName !== store) return false;

      // ✅ FILTRO DATA
      if (dateFilter === 'all') {
        return true; // Tutte le date
      }
      else if (dateFilter === 'current_month') {
        // Mese corrente: filtra per mese e anno
        const now = new Date();
        return rowDate.getMonth() === now.getMonth() &&
               rowDate.getFullYear() === now.getFullYear();
      }
      else if (dateFilter === 'last_month') {
        // Mese scorso
        const now = new Date();
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return rowDate.getMonth() === lastMonth &&
               rowDate.getFullYear() === lastMonthYear;
      }
      else if (dateFilter === 'custom') {
        // ✅ NUOVO: Filtro personalizzato per range di date o settimane

        // Se abbiamo weekFrom e weekTo, filtriamo per range di settimane
        if (weekFrom && weekTo) {
          const wFrom = parseInt(weekFrom);
          const wTo = parseInt(weekTo);
          return rowWeek >= wFrom && rowWeek <= wTo;
        }

        // Se abbiamo dateFrom e dateTo, filtriamo per range di date
        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          return rowDate >= fromDate && rowDate <= toDate;
        }

        // Backward compatibility: settimane separate da virgola
        if (weeks) {
          const selectedWeeks = weeks.split(',').filter(w => w.trim()).map(w => parseInt(w.trim()));
          return selectedWeeks.includes(rowWeek);
        }

        return true;
      }
      else {
        // Singola settimana specifica (backward compatibility)
        return rowWeek === parseInt(dateFilter);
      }
    });

    console.log(`✅ Righe filtrate: ${filteredRows.length}`);

    // ===== KPI GLOBALI =====
    const totalNetto = filteredRows.reduce((sum, r) => sum + parseNumber(r[COL.NETTO]), 0);
    const totalLordo = filteredRows.reduce((sum, r) => sum + parseNumber(r[COL.LORDO]), 0);
    const totalBudget = filteredRows.reduce((sum, r) => sum + parseNumber(r[COL.BUDGET]), 0);
    const totalNettoAP = filteredRows.reduce((sum, r) => sum + parseNumber(r[COL.NETTO_AP]), 0);
    const totalCoperti = filteredRows.reduce((sum, r) => sum + parseNumber(r[COL.COPERTI]), 0);
    
    // ✅ DELTA BUDGET: (Somma Netto / Somma Budget - 1) * 100
    const deltaBudgetPct = totalBudget > 0 ? ((totalNetto / totalBudget - 1) * 100) : 0;
    
    // ✅ DELTA ANNO: (Somma Netto / Somma Netto AP - 1) * 100
    const deltaAnnoPct = totalNettoAP > 0 ? ((totalNetto / totalNettoAP - 1) * 100) : 0;

    // ✅ SCONTRINO MEDIO: Solo sul canale STORE
    // Calcola fatturato store totale
    let totalFatturatoStore = 0;
    filteredRows.forEach(r => {
      const netto = parseNumber(r[COL.NETTO]);
      const pctStore = parseNumber(r[COL.PCT_STORE]);
      totalFatturatoStore += (netto * pctStore / 100);
    });
    const scontrinoMedio = totalCoperti > 0 ? (totalFatturatoStore / totalCoperti) : 0;

    console.log('💰 KPI Calcolati:', {
      totalNetto: totalNetto.toFixed(2),
      totalBudget: totalBudget.toFixed(2),
      totalNettoAP: totalNettoAP.toFixed(2),
      deltaBudgetPct: deltaBudgetPct.toFixed(2),
      deltaAnnoPct: deltaAnnoPct.toFixed(2),
      totalFatturatoStore: totalFatturatoStore.toFixed(2),
      totalCoperti,
      scontrinoMedio: scontrinoMedio.toFixed(2)
    });

    // Mix Canali (media ponderata per fatturato netto)
    let sumPctStore = 0, sumPctAsporto = 0, sumPctDeliveroo = 0, sumPctGlovo = 0, sumPctJustEat = 0;
    let totalPeso = 0;
    
    filteredRows.forEach(r => {
      const peso = parseNumber(r[COL.NETTO]);
      if (peso > 0) {
        sumPctStore += parseNumber(r[COL.PCT_STORE]) * peso;
        sumPctAsporto += parseNumber(r[COL.PCT_ASPORTO]) * peso;
        sumPctDeliveroo += parseNumber(r[COL.PCT_DELIVEROO]) * peso;
        sumPctGlovo += parseNumber(r[COL.PCT_GLOVO]) * peso;
        sumPctJustEat += parseNumber(r[COL.PCT_JUST_EAT]) * peso;
        totalPeso += peso;
      }
    });

    const mixCanali = {
      store: totalPeso > 0 ? (sumPctStore / totalPeso) : 0,
      asporto: totalPeso > 0 ? (sumPctAsporto / totalPeso) : 0,
      deliveroo: totalPeso > 0 ? (sumPctDeliveroo / totalPeso) : 0,
      glovo: totalPeso > 0 ? (sumPctGlovo / totalPeso) : 0,
      justEat: totalPeso > 0 ? (sumPctJustEat / totalPeso) : 0
    };

    // TIME SERIES
const timeSeriesMap = {};
filteredRows.forEach(r => {
  const date = formatDate(r[COL.DATA]);
  const week = r[COL.WEEK];
  
  let key;
  if (period === 'weekly') key = `W${week}`;
  else if (period === 'monthly') key = date.substring(0, 7); // YYYY-MM
  else key = date; // daily

  if (!timeSeriesMap[key]) {
    timeSeriesMap[key] = { netto: 0, lordo: 0, budget: 0, nettoAP: 0, coperti: 0 };
  }
  timeSeriesMap[key].netto += parseNumber(r[COL.NETTO]);
  timeSeriesMap[key].lordo += parseNumber(r[COL.LORDO]);
  timeSeriesMap[key].budget += parseNumber(r[COL.BUDGET]);
  timeSeriesMap[key].nettoAP += parseNumber(r[COL.NETTO_AP]); // ✅ AGGIUNTO
  timeSeriesMap[key].coperti += parseNumber(r[COL.COPERTI]);
});

    const timeSeries = Object.keys(timeSeriesMap).sort((a, b) => {
      if (period === 'weekly') {
        // "W1", "W2", "W46" -> estrai il numero e compara
        const numA = parseInt(a.replace('W', ''));
        const numB = parseInt(b.replace('W', ''));
        return numA - numB;
      } else {
        // daily: "2025-01-15" e monthly: "2025-01" -> sort alfabetico funziona
        return a.localeCompare(b);
      }
    }).map(k => ({
      period: k,
      ...timeSeriesMap[k]
    }));

    // ===== RANKING STORES =====
    const storeMap = {};
    filteredRows.forEach(r => {
      const storeName = r[COL.NOME];
      if (!storeName) return;
      
      if (!storeMap[storeName]) {
        storeMap[storeName] = {
          name: storeName,
          city: r[COL.CITTA],
          netto: 0,
          budget: 0,
          nettoAP: 0,
          coperti: 0,
          fatturatoStore: 0
        };
      }
      
      const netto = parseNumber(r[COL.NETTO]);
      const budget = parseNumber(r[COL.BUDGET]);
      const nettoAP = parseNumber(r[COL.NETTO_AP]);
      const pctStore = parseNumber(r[COL.PCT_STORE]);
      const coperti = parseNumber(r[COL.COPERTI]);
      
      storeMap[storeName].netto += netto;
      storeMap[storeName].budget += budget;
      storeMap[storeName].nettoAP += nettoAP;
      storeMap[storeName].coperti += coperti;
      storeMap[storeName].fatturatoStore += (netto * pctStore / 100);
    });

    const storesRanking = Object.values(storeMap)
      .map(s => {
        // ✅ Delta Budget: (Netto / Budget - 1) * 100
        const deltaBudgetPct = s.budget > 0 ? ((s.netto / s.budget - 1) * 100).toFixed(1) : '0.0';
        
        // ✅ Delta Anno: (Netto / Netto AP - 1) * 100
        const deltaAnnoPct = s.nettoAP > 0 ? ((s.netto / s.nettoAP - 1) * 100).toFixed(1) : '0.0';
        
        // ✅ Scontrino Medio: Fatturato Store / Coperti
        const scontrinoMedio = s.coperti > 0 ? (s.fatturatoStore / s.coperti).toFixed(2) : '0.00';
        
        return {
          name: s.name,
          city: s.city,
          netto: s.netto,
          budget: s.budget,
          nettoAP: s.nettoAP,
          coperti: s.coperti,
          deltaBudgetPct: deltaBudgetPct,
          deltaAnnoPct: deltaAnnoPct,
          scontrinoMedio: scontrinoMedio
        };
      })
      .sort((a, b) => b.netto - a.netto);

    // FILTRI DISPONIBILI
    const weeksSet = new Set();
    const citiesSet = new Set();
    const storesSet = new Set();
    rows.forEach(r => {
      const week = r[COL.WEEK];
      const city = r[COL.CITTA];
      const store = r[COL.NOME];
      if (week) weeksSet.add(week);
      if (city) citiesSet.add(city);
      if (store) storesSet.add(store);
    });

    const filters = {
      weeks: [...weeksSet].sort((a, b) => a - b),
      cities: [...citiesSet].sort(),
      stores: [...storesSet].sort()
    };

    // RESPONSE
    res.json({
      filters,
      kpis: {
        fatturatoNetto: totalNetto,
        fatturatoLordo: totalLordo,
        budget: totalBudget,
        nettoAP: totalNettoAP,
        deltaBudgetPct: deltaBudgetPct.toFixed(2),
        deltaAnnoPct: deltaAnnoPct.toFixed(2),
        coperti: totalCoperti,
        scontrinoMedio: scontrinoMedio.toFixed(2),
        mixCanali
      },
      timeSeries,
      storesRanking
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/heatmap-weekly
 * Restituisce dati per heatmap settimanale: tutti gli store per tutte le settimane
 * con delta budget e delta anno precedente
 */
export async function getHeatmapWeeklyData(req, res) {
  try {
    console.log('📥 /api/heatmap-weekly called');

    const data = await getFatturatoSheetsData();
    const rows = data.fatturato.slice(1); // Skip header

    // Mappa: store -> week -> { netto, budget, nettoAP }
    const heatmapData = {};
    const weeksSet = new Set();
    const storesSet = new Set();

    rows.forEach(r => {
      const storeName = r[COL.NOME];
      const week = parseInt(r[COL.WEEK]) || 0;

      if (!storeName || week === 0) return;

      weeksSet.add(week);
      storesSet.add(storeName);

      if (!heatmapData[storeName]) {
        heatmapData[storeName] = {};
      }
      if (!heatmapData[storeName][week]) {
        heatmapData[storeName][week] = { netto: 0, budget: 0, nettoAP: 0 };
      }

      heatmapData[storeName][week].netto += parseNumber(r[COL.NETTO]);
      heatmapData[storeName][week].budget += parseNumber(r[COL.BUDGET]);
      heatmapData[storeName][week].nettoAP += parseNumber(r[COL.NETTO_AP]);
    });

    // Ordina settimane e store
    const weeks = [...weeksSet].sort((a, b) => a - b);
    const stores = [...storesSet].sort();

    // Costruisci matrice heatmap per delta budget
    const deltaBudgetMatrix = stores.map(store => {
      return {
        store,
        values: weeks.map(week => {
          const data = heatmapData[store]?.[week];
          if (!data || data.budget === 0) return null;
          // Delta Budget: (Netto / Budget - 1) * 100
          return parseFloat(((data.netto / data.budget - 1) * 100).toFixed(1));
        })
      };
    });

    // Costruisci matrice heatmap per delta anno
    const deltaAnnoMatrix = stores.map(store => {
      return {
        store,
        values: weeks.map(week => {
          const data = heatmapData[store]?.[week];
          if (!data || data.nettoAP === 0) return null;
          // Delta Anno: (Netto / Netto AP - 1) * 100
          return parseFloat(((data.netto / data.nettoAP - 1) * 100).toFixed(1));
        })
      };
    });

    res.json({
      success: true,
      weeks,
      stores,
      deltaBudget: deltaBudgetMatrix,
      deltaAnno: deltaAnnoMatrix
    });

  } catch (error) {
    console.error('❌ Error in getHeatmapWeeklyData:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
import { getGlovoSheetsData } from './googleSheets.js';

// ✅ STORE MAPPING - 31 store Fradiavolo
const STORE_MAPPING = {
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

// ✅ INDICI COLONNE
const COL = {
  ADS: {
    STORE: 0, SID: 1, SAID: 2, PLACEMENT: 3, WEEK: 4,
    IMPRESSIONS: 5, CLICKS: 6, CONVERSIONS: 7, TOTAL_ADS: 8,
    ADS_GLOVO: 9, ADS_FDV: 10, GMV: 11, ROAS: 12, CTR: 13
  },
  OPS: {
    WEEK_NUM: 0, STORE_NAME: 1, CITY_CODE: 2, SID: 3, SAID: 4,
    ADDRESS: 5, TOTAL_ORDERS: 6, DELIVERED_ORDERS: 7, TOT_DELIVERY_TIME: 8,
    PREP_TIME: 9, AWTP: 10, WMI: 11, CDTP: 12, UPTIME: 13, RATING: 14
  },
  ORDERS: {
    WEEK_NUM: 0, CITY_CODE: 1, SID: 2, SAID: 3,
    ADDRESS: 4, DELIVERED_ORDERS: 5, GMV: 6
  },
  PROMO: {
    WEEK_NUM: 0, CITY: 1, SAID: 2, ADDRESS: 3,
    PRODUCT_PROMO: 4, DELIVERY_PROMO: 5, TOTAL_SPENT: 6, GLOVO_SPENDING: 7
  },
  ITEMS: {
    N_WEEK: 0, WEEK: 1, PRODUCT: 2, QUANTITY: 3, PRICE: 4
  }
};

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

function weekNumToISOWeek(num) {
  if (!num) return null;
  const year = new Date().getFullYear();
  return `${year}-W${String(num).padStart(2, '0')}`;
}

function parseNumber(val) {
  if (!val) return 0;
  let str = val.toString()
    .replace(/€/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  return parseFloat(str) || 0;
}

// ===== FUNZIONE GENERAZIONE INSIGHTS =====
function generateInsights(params) {
  const {
    storesRanking,
    opsStoreTable,
    promoFiltered,
    ordersFiltered
  } = params;

  const insights = {
    operational: {
      critical: [],
      topPerformers: []
    },
    advertising: {
      lowROAS: [],
      highROAS: []
    },
    promotions: {
      highPromo: []
    }
  };

  // ===== SEGNALAZIONI OPERATIVE =====
  opsStoreTable.forEach(store => {
    const storeData = {
      storeId: store.id,
      storeName: store.name,
      city: store.city,
      issues: []
    };

    // Uptime basso
    if (parseFloat(store.uptime) < 95) {
      storeData.issues.push({
        type: 'UPTIME_BASSO',
        severity: 'high',
        metric: 'Uptime',
        value: store.uptime + '%',
        threshold: '< 95%',
        message: `Store offline troppo spesso (${store.uptime}%). Verificare disponibilità operativa.`
      });
    }

    // Rating basso
    if (parseFloat(store.rating) < 4.5 && parseFloat(store.rating) > 0) {
      storeData.issues.push({
        type: 'RATING_BASSO',
        severity: 'high',
        metric: 'Rating',
        value: store.rating,
        threshold: '< 4.5',
        message: `Rating sotto la media (${store.rating}). Verificare qualità del servizio.`
      });
    }

    // WMI alto
    if (parseFloat(store.wmi) > 5) {
      storeData.issues.push({
        type: 'WMI_ALTO',
        severity: 'high',
        metric: 'WMI',
        value: store.wmi + '%',
        threshold: '> 5%',
        message: `Troppi ordini errati/mancanti (${store.wmi}%). Migliorare controllo qualità.`
      });
    }

    if (storeData.issues.length > 0) {
      insights.operational.critical.push(storeData);
    }
  });

  // Top Performers Operativi
  insights.operational.topPerformers = opsStoreTable
    .filter(s => parseFloat(s.rating) >= 4.8 && parseFloat(s.uptime) >= 98 && parseFloat(s.wmi) <= 2)
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, 5)
    .map(s => ({
      name: s.name,
      city: s.city,
      rating: s.rating,
      uptime: s.uptime,
      wmi: s.wmi,
      deliveryTime: s.deliveryTime
    }));

  // ===== SEGNALAZIONI PUBBLICITARIE =====
  storesRanking.forEach(store => {
    // ROAS basso
    if (parseFloat(store.roas) < 2 && store.spendTotal > 0) {
      insights.advertising.lowROAS.push({
        storeId: store.id,
        storeName: store.name,
        city: store.city,
        roas: store.roas,
        spend: store.spendTotal,
        gmvGenerated: store.gmv,
        message: `ROAS critico (${store.roas}x). Spesa: €${Math.round(store.spendTotal)}, GMV attribuito: €${Math.round(store.gmv)}`
      });
    }

    // ROAS alto (top performers)
    if (parseFloat(store.roas) >= 5 && store.spendTotal > 0) {
      insights.advertising.highROAS.push({
        storeId: store.id,
        storeName: store.name,
        city: store.city,
        roas: store.roas,
        spend: store.spendTotal,
        gmvGenerated: store.gmv,
        message: `ROAS eccellente (${store.roas}x). Spesa: €${Math.round(store.spendTotal)}, GMV attribuito: €${Math.round(store.gmv)}`
      });
    }
  });

  // Ordina per ROAS
  insights.advertising.lowROAS.sort((a, b) => parseFloat(a.roas) - parseFloat(b.roas));
  insights.advertising.highROAS.sort((a, b) => parseFloat(b.roas) - parseFloat(a.roas)).slice(0, 5);

  // ===== SEGNALAZIONI PROMO =====
  // Calcola % promo per store
  const promoByStore = {};
  promoFiltered.forEach(r => {
    const said = r[COL.PROMO.SAID];
    if (!STORE_MAPPING[said]) return;
    
    if (!promoByStore[said]) {
      promoByStore[said] = {
        name: STORE_MAPPING[said].name,
        city: STORE_MAPPING[said].city,
        productPromo: 0,
        gmv: 0
      };
    }
    promoByStore[said].productPromo += parseNumber(r[COL.PROMO.PRODUCT_PROMO]);
  });

  ordersFiltered.forEach(r => {
    const said = r[COL.ORDERS.SAID];
    if (promoByStore[said]) {
      promoByStore[said].gmv += parseNumber(r[COL.ORDERS.GMV]);
    }
  });

  Object.entries(promoByStore).forEach(([said, data]) => {
    const percentPromo = (data.gmv + data.productPromo) > 0 
      ? (data.productPromo / (data.gmv + data.productPromo)) * 100 
      : 0;

    if (percentPromo > 20) {
      insights.promotions.highPromo.push({
        storeId: said,
        storeName: data.name,
        city: data.city,
        percentPromo: percentPromo.toFixed(1),
        productPromo: data.productPromo,
        gmv: data.gmv,
        message: `% Promo elevata (${percentPromo.toFixed(1)}%). Spesa promo: €${Math.round(data.productPromo)}, GMV: €${Math.round(data.gmv)}`
      });
    }
  });

  insights.promotions.highPromo.sort((a, b) => parseFloat(b.percentPromo) - parseFloat(a.percentPromo));

  return insights;
}

export async function getAllData(req, res) {
  try {
    const { week = 'all', city = 'all', store = 'all' } = req.query;
    const data = await getGlovoSheetsData();

    // Supporto multi-selezione: i valori possono essere separati da virgola
    const weekList = week === 'all' ? null : week.split(',');
    const cityList = city === 'all' ? null : city.split(',');
    const storeList = store === 'all' ? null : store.split(',');

    console.log(`📊 Request: week=${week}, city=${city}, store=${store}`);

    const filterRow = (row, sheetType) => {
      const saidIndex = COL[sheetType]?.SAID;
      if (!saidIndex) return true;

      const rowSaid = row[saidIndex];
      const storeInfo = STORE_MAPPING[rowSaid];
      if (!storeInfo) return false;

      if (weekList) {
        let rowWeek;
        if (sheetType === 'ADS') {
          rowWeek = dateToISOWeek(row[COL.ADS.WEEK]);
        } else {
          rowWeek = weekNumToISOWeek(row[COL[sheetType].WEEK_NUM]);
        }
        if (!weekList.includes(rowWeek)) return false;
      }

      if (cityList && !cityList.includes(storeInfo.city)) return false;
      if (storeList && !storeList.includes(rowSaid)) return false;

      return true;
    };

    const adsFiltered = data.ads.slice(1).filter(r => filterRow(r, 'ADS'));
    const opsFiltered = data.ops.slice(1).filter(r => filterRow(r, 'OPS'));
    const ordersFiltered = data.orders.slice(1).filter(r => filterRow(r, 'ORDERS'));
    const promoFiltered = data.promo.slice(1).filter(r => filterRow(r, 'PROMO'));
    const itemsFiltered = data.items.slice(1).filter(r => {
      if (!weekList) return true;
      const weekISO = dateToISOWeek(r[COL.ITEMS.WEEK]);
      return weekList.includes(weekISO);
    });

    // KPI
    const totalGMV = ordersFiltered.reduce((sum, r) => sum + parseNumber(r[COL.ORDERS.GMV]), 0);
    const totalOrders = ordersFiltered.reduce((sum, r) => sum + (parseInt(r[COL.ORDERS.DELIVERED_ORDERS]) || 0), 0);
    const aov = totalOrders > 0 ? (totalGMV / totalOrders) : 0;
    
    const adsSpendFradiavolo = adsFiltered.reduce((sum, r) => sum + parseNumber(r[COL.ADS.ADS_FDV]), 0);
    const adsSpendGlovo = adsFiltered.reduce((sum, r) => sum + parseNumber(r[COL.ADS.ADS_GLOVO]), 0);
    const adsSpendTotal = adsSpendFradiavolo + adsSpendGlovo;
    
    const gmvGenerate = adsFiltered.reduce((sum, r) => sum + parseNumber(r[COL.ADS.GMV]), 0);
    const roas = adsSpendTotal > 0 ? (gmvGenerate / adsSpendTotal) : 0;
    
    const promoCostFradiavolo = promoFiltered.reduce((sum, r) => sum + parseNumber(r[COL.PROMO.PRODUCT_PROMO]), 0);
    
    const commissioneGlovo = totalGMV * 0.25;
    const costNumerator = commissioneGlovo + promoCostFradiavolo + adsSpendFradiavolo;
    const costDenominator = totalGMV + promoCostFradiavolo;
    const percentCost = costDenominator > 0 ? ((costNumerator / costDenominator) * 100) : 0;
    
    const deliveryTimeTotal = opsFiltered.reduce((sum, r) => sum + (parseFloat(r[COL.OPS.TOT_DELIVERY_TIME]) || 0), 0);
    const deliveryTimeAvg = opsFiltered.length > 0 ? (deliveryTimeTotal / opsFiltered.length) : 0;
    
    const totalImpressions = adsFiltered.reduce((sum, r) => sum + (parseInt(r[COL.ADS.IMPRESSIONS]) || 0), 0);
    const totalClicks = adsFiltered.reduce((sum, r) => sum + (parseInt(r[COL.ADS.CLICKS]) || 0), 0);
    const totalConversions = adsFiltered.reduce((sum, r) => sum + (parseInt(r[COL.ADS.CONVERSIONS]) || 0), 0);
    
    const avgRating = opsFiltered.length > 0
      ? (opsFiltered.reduce((sum, r) => sum + (parseFloat(r[COL.OPS.RATING]) || 0), 0) / opsFiltered.length)
      : 0;

    // Filtri
    const weeksSet = new Set();
    data.ads.slice(1).forEach(r => {
      const w = dateToISOWeek(r[COL.ADS.WEEK]);
      if (w) weeksSet.add(w);
    });
    [data.orders, data.ops, data.promo].forEach(sheet => {
      sheet.slice(1).forEach(r => {
        const weekNum = r[0];
        const w = weekNumToISOWeek(weekNum);
        if (w) weeksSet.add(w);
      });
    });
    data.items.slice(1).forEach(r => {
      const w = dateToISOWeek(r[COL.ITEMS.WEEK]);
      if (w) weeksSet.add(w);
    });
    
    const weeks = [...weeksSet].sort().reverse();
    const cities = [...new Set(Object.values(STORE_MAPPING).map(s => s.city))].sort();
    const stores = Object.entries(STORE_MAPPING).map(([id, info]) => ({
      id, name: info.name, city: info.city
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Stores Performance
    const storePerformance = {};
    const storeWeekGMV = {};
    
    data.orders.slice(1).forEach(r => {
      const said = r[COL.ORDERS.SAID];
      const weekNum = r[COL.ORDERS.WEEK_NUM];
      const weekISO = weekNumToISOWeek(weekNum);
      
      if (!STORE_MAPPING[said] || !weekISO) return;
      
      if (!storeWeekGMV[said]) storeWeekGMV[said] = {};
      if (!storeWeekGMV[said][weekISO]) storeWeekGMV[said][weekISO] = 0;
      storeWeekGMV[said][weekISO] += parseNumber(r[COL.ORDERS.GMV]);
    });

    ordersFiltered.forEach(r => {
      const said = r[COL.ORDERS.SAID];
      if (!STORE_MAPPING[said]) return;
      
      if (!storePerformance[said]) {
        storePerformance[said] = {
          id: said,
          name: STORE_MAPPING[said].name,
          city: STORE_MAPPING[said].city,
          orders: 0,
          gmv: 0,
          spendFradiavolo: 0,
          spendGlovo: 0,
          spendTotal: 0,
          productPromo: 0,
          rating: 0,
          ratingCount: 0
        };
      }
      
      storePerformance[said].orders += parseInt(r[COL.ORDERS.DELIVERED_ORDERS]) || 0;
      storePerformance[said].gmv += parseNumber(r[COL.ORDERS.GMV]);
    });

    if (week !== 'all') {
      opsFiltered.forEach(r => {
        const said = r[COL.OPS.SAID];
        if (storePerformance[said]) {
          const rating = parseFloat(r[COL.OPS.RATING]) || 0;
          if (rating > 0) {
            storePerformance[said].rating = rating;
            storePerformance[said].ratingCount = 1;
          }
        }
      });
    } else {
      opsFiltered.forEach(r => {
        const said = r[COL.OPS.SAID];
        if (storePerformance[said]) {
          const rating = parseFloat(r[COL.OPS.RATING]) || 0;
          if (rating > 0) {
            storePerformance[said].rating += rating;
            storePerformance[said].ratingCount += 1;
          }
        }
      });
    }

    adsFiltered.forEach(r => {
      const said = r[COL.ADS.SAID];
      if (storePerformance[said]) {
        const spendFdv = parseNumber(r[COL.ADS.ADS_FDV]);
        const spendGlv = parseNumber(r[COL.ADS.ADS_GLOVO]);
        storePerformance[said].spendFradiavolo += spendFdv;
        storePerformance[said].spendGlovo += spendGlv;
        storePerformance[said].spendTotal += spendFdv + spendGlv;
      }
    });

    // Accumula Product Promo by Partner per store (Sconti)
    promoFiltered.forEach(r => {
      const said = r[COL.PROMO.SAID];
      if (storePerformance[said]) {
        storePerformance[said].productPromo += parseNumber(r[COL.PROMO.PRODUCT_PROMO]);
      }
    });

    let growthWoW = {};
    if (week !== 'all') {
      const currentWeekMatch = week.match(/(\d{4})-W(\d{2})/);
      if (currentWeekMatch) {
        const year = parseInt(currentWeekMatch[1]);
        let weekNum = parseInt(currentWeekMatch[2]);
        weekNum -= 1;
        if (weekNum < 1) weekNum = 52;
        const prevWeek = `${year}-W${String(weekNum).padStart(2, '0')}`;
        
        Object.keys(storePerformance).forEach(said => {
          const currentGMV = storeWeekGMV[said]?.[week] || 0;
          const prevGMV = storeWeekGMV[said]?.[prevWeek] || 0;
          
          if (prevGMV > 0) {
            growthWoW[said] = ((currentGMV - prevGMV) / prevGMV * 100).toFixed(1);
          } else {
            growthWoW[said] = currentGMV > 0 ? '100.0' : '0.0';
          }
        });
      }
    }

    const storesRanking = Object.values(storePerformance)
      .map(s => {
        const avgRating = s.ratingCount > 0 ? (s.rating / s.ratingCount) : 0;
        // Fatturato Netto Costi = GMV - Sconti (productPromo) - Adv a carico Fradiavolo
        const fatturatoNettoCosti = s.gmv - s.productPromo - s.spendFradiavolo;
        return {
          ...s,
          rating: avgRating.toFixed(1),
          roas: s.spendTotal > 0 ? (s.gmv / s.spendTotal).toFixed(2) : '0',
          cpo: s.orders > 0 ? (s.spendTotal / s.orders).toFixed(2) : '0',
          aov: s.orders > 0 ? (s.gmv / s.orders).toFixed(2) : '0',
          growthWoW: growthWoW[s.id] || null,
          fatturatoNettoCosti: fatturatoNettoCosti
        };
      })
      .sort((a, b) => b.gmv - a.gmv);
    
    // Time Series con GMV, Promo e Ads per calcolare Fatturato Netto
    const timeSeriesData = {};

    // Inizializza struttura
    const initStoreWeek = (storeId, weekISO) => {
      if (!timeSeriesData[storeId]) timeSeriesData[storeId] = {};
      if (!timeSeriesData[storeId][weekISO]) {
        timeSeriesData[storeId][weekISO] = { gmv: 0, productPromo: 0, spendFradiavolo: 0 };
      }
    };

    // GMV per settimana/store
    data.orders.slice(1).forEach(r => {
      const said = r[COL.ORDERS.SAID];
      const weekNum = r[COL.ORDERS.WEEK_NUM];
      const weekISO = weekNumToISOWeek(weekNum);
      const gmv = parseNumber(r[COL.ORDERS.GMV]);

      if (!STORE_MAPPING[said] || !weekISO) return;

      initStoreWeek('_total', weekISO);
      timeSeriesData['_total'][weekISO].gmv += gmv;

      initStoreWeek(said, weekISO);
      timeSeriesData[said][weekISO].gmv += gmv;
    });

    // Product Promo per settimana/store
    data.promo.slice(1).forEach(r => {
      const said = r[COL.PROMO.SAID];
      const weekNum = r[COL.PROMO.WEEK_NUM];
      const weekISO = weekNumToISOWeek(weekNum);
      const productPromo = parseNumber(r[COL.PROMO.PRODUCT_PROMO]);

      if (!STORE_MAPPING[said] || !weekISO) return;

      initStoreWeek('_total', weekISO);
      timeSeriesData['_total'][weekISO].productPromo += productPromo;

      initStoreWeek(said, weekISO);
      timeSeriesData[said][weekISO].productPromo += productPromo;
    });

    // Ads Fradiavolo per settimana/store
    data.ads.slice(1).forEach(r => {
      const said = r[COL.ADS.SAID];
      const weekNum = r[COL.ADS.WEEK_NUM];
      const weekISO = weekNumToISOWeek(weekNum);
      const spendFdv = parseNumber(r[COL.ADS.ADS_FDV]);

      if (!STORE_MAPPING[said] || !weekISO) return;

      initStoreWeek('_total', weekISO);
      timeSeriesData['_total'][weekISO].spendFradiavolo += spendFdv;

      initStoreWeek(said, weekISO);
      timeSeriesData[said][weekISO].spendFradiavolo += spendFdv;
    });

    const timeSeries = {};
    Object.keys(timeSeriesData).forEach(storeId => {
      const weeks = Object.keys(timeSeriesData[storeId]).sort();
      timeSeries[storeId] = weeks.map(w => {
        const d = timeSeriesData[storeId][w];
        return {
          week: w,
          gmv: d.gmv,
          fatturatoNettoCosti: d.gmv - d.productPromo - d.spendFradiavolo
        };
      });
    });

    // PROMO
    const promoByWeek = {};
    data.promo.slice(1).forEach(r => {
      const weekNum = r[COL.PROMO.WEEK_NUM];
      const weekISO = weekNumToISOWeek(weekNum);
      if (!weekISO) return;
      
      if (!promoByWeek[weekISO]) {
        promoByWeek[weekISO] = { productPromo: 0, gmv: 0 };
      }
      promoByWeek[weekISO].productPromo += parseNumber(r[COL.PROMO.PRODUCT_PROMO]);
    });
    
    data.orders.slice(1).forEach(r => {
      const weekNum = r[COL.ORDERS.WEEK_NUM];
      const weekISO = weekNumToISOWeek(weekNum);
      if (!weekISO || !promoByWeek[weekISO]) return;
      promoByWeek[weekISO].gmv += parseNumber(r[COL.ORDERS.GMV]);
    });
    
    const promoTrendData = Object.keys(promoByWeek)
      .sort()
      .map(w => {
        const productPromo = promoByWeek[w].productPromo;
        const gmv = promoByWeek[w].gmv;
        const percentPromo = (gmv + productPromo) > 0 
          ? (productPromo / (gmv + productPromo)) * 100 
          : 0;
        return { week: w, productPromo, percentPromo };
      });
    
    const totalProductPromoByPartner = promoFiltered.reduce((sum, r) => 
      sum + parseNumber(r[COL.PROMO.PRODUCT_PROMO]), 0
    );
    const totalGMVForPromo = ordersFiltered.reduce((sum, r) => 
      sum + parseNumber(r[COL.ORDERS.GMV]), 0
    );
    const percentPromoKPI = (totalGMVForPromo + totalProductPromoByPartner) > 0
      ? (totalProductPromoByPartner / (totalGMVForPromo + totalProductPromoByPartner)) * 100
      : 0;

    // OPS
    const opsMetrics = {
      avgRating: 0,
      avgDeliveryTime: 0,
      avgWMI: 0,
      avgUptime: 0
    };
    
    if (opsFiltered.length > 0) {
      const ratingsNonZero = opsFiltered
        .map(r => parseFloat(r[COL.OPS.RATING]) || 0)
        .filter(rating => rating > 0);
      opsMetrics.avgRating = ratingsNonZero.length > 0
        ? ratingsNonZero.reduce((a, b) => a + b, 0) / ratingsNonZero.length
        : 0;
      
      const deliveryTimes = opsFiltered
        .map(r => parseFloat(r[COL.OPS.TOT_DELIVERY_TIME]))
        .filter(dt => !isNaN(dt) && dt > 0);
      opsMetrics.avgDeliveryTime = deliveryTimes.length > 0
        ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
        : 0;
      
      const wmis = opsFiltered
        .map(r => parseNumber(r[COL.OPS.WMI]))
        .filter(wmi => !isNaN(wmi));
      opsMetrics.avgWMI = wmis.length > 0
        ? wmis.reduce((a, b) => a + b, 0) / wmis.length
        : 0;
      
      const uptimes = opsFiltered
        .map(r => parseNumber(r[COL.OPS.UPTIME]))
        .filter(uptime => !isNaN(uptime));
      opsMetrics.avgUptime = uptimes.length > 0
        ? uptimes.reduce((a, b) => a + b, 0) / uptimes.length
        : 0;
    }
    
    const opsStorePerformance = {};
    opsFiltered.forEach(r => {
      const said = r[COL.OPS.SAID];
      if (!STORE_MAPPING[said]) return;
      
      if (!opsStorePerformance[said]) {
        opsStorePerformance[said] = {
          name: STORE_MAPPING[said].name,
          city: STORE_MAPPING[said].city,
          rating: [],
          deliveryTime: [],
          wmi: [],
          uptime: []
        };
      }
      
      const rating = parseNumber(r[COL.OPS.RATING]);
      const deliveryTime = parseNumber(r[COL.OPS.TOT_DELIVERY_TIME]);
      const wmi = parseNumber(r[COL.OPS.WMI]);
      const uptime = parseNumber(r[COL.OPS.UPTIME]);
      
      if (!isNaN(rating) && rating > 0) opsStorePerformance[said].rating.push(rating);
      if (!isNaN(deliveryTime) && deliveryTime > 0) opsStorePerformance[said].deliveryTime.push(deliveryTime);
      if (!isNaN(wmi)) opsStorePerformance[said].wmi.push(wmi);
      if (!isNaN(uptime)) opsStorePerformance[said].uptime.push(uptime);
    });
    
    const opsStoreTable = Object.entries(opsStorePerformance).map(([said, metrics]) => {
      const avgRating = metrics.rating.length > 0 
        ? metrics.rating.reduce((a, b) => a + b, 0) / metrics.rating.length 
        : 0;
      const avgDeliveryTime = metrics.deliveryTime.length > 0
        ? metrics.deliveryTime.reduce((a, b) => a + b, 0) / metrics.deliveryTime.length
        : 0;
      const avgWMI = metrics.wmi.length > 0
        ? metrics.wmi.reduce((a, b) => a + b, 0) / metrics.wmi.length
        : 0;
      const avgUptime = metrics.uptime.length > 0
        ? metrics.uptime.reduce((a, b) => a + b, 0) / metrics.uptime.length
        : 0;
      
      const alerts = [];
      if (avgRating < 4.5) alerts.push('Rating Basso');
      if (avgWMI > 5) alerts.push('WMI Alto');
      if (avgUptime < 95) alerts.push('Uptime Basso');
      
      return {
        id: said,
        name: metrics.name,
        city: metrics.city,
        rating: avgRating.toFixed(2),
        deliveryTime: avgDeliveryTime.toFixed(1),
        wmi: avgWMI.toFixed(2),
        uptime: avgUptime.toFixed(1),
        alerts: alerts.length > 0 ? alerts : null
      };
    });
    
    const opsTimeSeriesRating = {};
    const opsTimeSeriesDeliveryTime = {};
    const opsTimeSeriesWMI = {};
    
    data.ops.slice(1).forEach(r => {
      const said = r[COL.OPS.SAID];
      const weekNum = r[COL.OPS.WEEK_NUM];
      const weekISO = weekNumToISOWeek(weekNum);
      
      if (!STORE_MAPPING[said] || !weekISO) return;
      
      const rating = parseNumber(r[COL.OPS.RATING]);
      const deliveryTime = parseNumber(r[COL.OPS.TOT_DELIVERY_TIME]);
      const wmi = parseNumber(r[COL.OPS.WMI]);
      
      if (!opsTimeSeriesRating[said]) opsTimeSeriesRating[said] = {};
      if (!opsTimeSeriesRating[said][weekISO]) opsTimeSeriesRating[said][weekISO] = [];
      if (!isNaN(rating) && rating > 0) opsTimeSeriesRating[said][weekISO].push(rating);
      
      if (!opsTimeSeriesRating['_total']) opsTimeSeriesRating['_total'] = {};
      if (!opsTimeSeriesRating['_total'][weekISO]) opsTimeSeriesRating['_total'][weekISO] = [];
      if (!isNaN(rating) && rating > 0) opsTimeSeriesRating['_total'][weekISO].push(rating);
      
      if (!opsTimeSeriesDeliveryTime[said]) opsTimeSeriesDeliveryTime[said] = {};
      if (!opsTimeSeriesDeliveryTime[said][weekISO]) opsTimeSeriesDeliveryTime[said][weekISO] = [];
      if (!isNaN(deliveryTime) && deliveryTime > 0) opsTimeSeriesDeliveryTime[said][weekISO].push(deliveryTime);
      
      if (!opsTimeSeriesDeliveryTime['_total']) opsTimeSeriesDeliveryTime['_total'] = {};
      if (!opsTimeSeriesDeliveryTime['_total'][weekISO]) opsTimeSeriesDeliveryTime['_total'][weekISO] = [];
      if (!isNaN(deliveryTime) && deliveryTime > 0) opsTimeSeriesDeliveryTime['_total'][weekISO].push(deliveryTime);
      
      if (!opsTimeSeriesWMI[said]) opsTimeSeriesWMI[said] = {};
      if (!opsTimeSeriesWMI[said][weekISO]) opsTimeSeriesWMI[said][weekISO] = [];
      if (!isNaN(wmi)) opsTimeSeriesWMI[said][weekISO].push(wmi);
      
      if (!opsTimeSeriesWMI['_total']) opsTimeSeriesWMI['_total'] = {};
      if (!opsTimeSeriesWMI['_total'][weekISO]) opsTimeSeriesWMI['_total'][weekISO] = [];
      if (!isNaN(wmi)) opsTimeSeriesWMI['_total'][weekISO].push(wmi);
    });
    
    const formatOpsTimeSeries = (data) => {
      const result = {};
      Object.keys(data).forEach(storeId => {
        const weeks = Object.keys(data[storeId]).sort();
        result[storeId] = weeks.map(w => {
          const values = data[storeId][w];
          const avg = values.length > 0 
            ? values.reduce((a, b) => a + b, 0) / values.length 
            : 0;
          return { week: w, value: avg };
        });
      });
      return result;
    };
    
    const opsRatingTimeSeries = formatOpsTimeSeries(opsTimeSeriesRating);
    const opsDeliveryTimeTimeSeries = formatOpsTimeSeries(opsTimeSeriesDeliveryTime);
    const opsWMITimeSeries = formatOpsTimeSeries(opsTimeSeriesWMI);

    // ITEMS
    const itemsMetrics = {
      totalQuantity: 0,
      totalRevenue: 0,
      topProduct: '',
      topProductQty: 0
    };
    
    const itemsProductMap = {};
    
    itemsFiltered.forEach(r => {
      const product = r[COL.ITEMS.PRODUCT];
      const quantity = parseInt(r[COL.ITEMS.QUANTITY]) || 0;
      const price = parseNumber(r[COL.ITEMS.PRICE]);
      const revenue = quantity * price;
      
      itemsMetrics.totalQuantity += quantity;
      itemsMetrics.totalRevenue += revenue;
      
      if (!itemsProductMap[product]) {
        itemsProductMap[product] = { quantity: 0, revenue: 0 };
      }
      itemsProductMap[product].quantity += quantity;
      itemsProductMap[product].revenue += revenue;
    });
    
    const itemsTop10 = Object.entries(itemsProductMap)
      .map(([product, data]) => ({
        product,
        quantity: data.quantity,
        revenue: data.revenue,
        avgPrice: data.quantity > 0 ? (data.revenue / data.quantity) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    if (itemsTop10.length > 0) {
      itemsMetrics.topProduct = itemsTop10[0].product;
      itemsMetrics.topProductQty = itemsTop10[0].quantity;
    }
    
    const itemsTimeSeriesData = {};
    data.items.slice(1).forEach(r => {
      const weekISO = dateToISOWeek(r[COL.ITEMS.WEEK]);
      if (!weekISO) return;
      
      if (!itemsTimeSeriesData[weekISO]) {
        itemsTimeSeriesData[weekISO] = { quantity: 0, revenue: 0 };
      }
      
      const quantity = parseInt(r[COL.ITEMS.QUANTITY]) || 0;
      const price = parseNumber(r[COL.ITEMS.PRICE]);
      
      itemsTimeSeriesData[weekISO].quantity += quantity;
      itemsTimeSeriesData[weekISO].revenue += quantity * price;
    });
    
    const itemsTimeSeries = Object.keys(itemsTimeSeriesData)
      .sort()
      .map(w => ({
        week: w,
        quantity: itemsTimeSeriesData[w].quantity,
        revenue: itemsTimeSeriesData[w].revenue
      }));

    const itemsByProduct = {};
    data.items.slice(1).forEach(r => {
      const product = r[COL.ITEMS.PRODUCT];
      const weekISO = dateToISOWeek(r[COL.ITEMS.WEEK]);
      if (!product || !weekISO) return;
      
      if (!itemsByProduct[product]) {
        itemsByProduct[product] = {};
      }
      
      if (!itemsByProduct[product][weekISO]) {
        itemsByProduct[product][weekISO] = { quantity: 0, revenue: 0 };
      }
      
      const quantity = parseInt(r[COL.ITEMS.QUANTITY]) || 0;
      const price = parseNumber(r[COL.ITEMS.PRICE]);
      
      itemsByProduct[product][weekISO].quantity += quantity;
      itemsByProduct[product][weekISO].revenue += quantity * price;
    });
    
    const itemsByProductFormatted = {};
    Object.keys(itemsByProduct).forEach(product => {
      const weeks = Object.keys(itemsByProduct[product]).sort();
      itemsByProductFormatted[product] = {
        timeSeries: weeks.map(w => ({
          week: w,
          quantity: itemsByProduct[product][w].quantity,
          revenue: itemsByProduct[product][w].revenue
        }))
      };
    });

    // ===== PREPARA DATI PER INSIGHTS (usa GMV attribuito dalle ADS) =====
const adsStoresRanking = [];

Object.entries(storePerformance).forEach(([said, store]) => {
  // Calcola GMV attribuito dalle ADS per questo store
  const adsData = adsFiltered.filter(r => r[COL.ADS.SAID] === said);
  const gmvFromAds = adsData.reduce((sum, r) => sum + parseNumber(r[COL.ADS.GMV]), 0);
  
  // Calcola ROAS con GMV attribuito
  const roas = store.spendTotal > 0 ? (gmvFromAds / store.spendTotal) : 0;
  
  const avgRating = store.ratingCount > 0 ? (store.rating / store.ratingCount) : 0;
  
  adsStoresRanking.push({
    id: said,
    name: store.name,
    city: store.city,
    spendTotal: store.spendTotal,
    gmv: gmvFromAds,  // ✅ GMV ATTRIBUITO (non totale)
    roas: roas.toFixed(2),
    rating: avgRating.toFixed(1)
  });
});

console.log('🔍 DEBUG - Stores con ROAS < 2 (GMV attribuito dalle ADS):');
adsStoresRanking.forEach(s => {
  if (parseFloat(s.roas) < 2 && s.spendTotal > 0) {
    console.log(`  - ${s.name}: ROAS=${s.roas}x, Spesa=€${Math.round(s.spendTotal)}, GMV attribuito=€${Math.round(s.gmv)}`);
  }
});

// ===== GENERA INSIGHTS =====
const analysisInsights = generateInsights({
  storesRanking: adsStoresRanking,  // ✅ USA DATI CON GMV ATTRIBUITO
  opsStoreTable,
  promoFiltered,
  ordersFiltered
});

    // ===== RESPONSE =====
    res.json({
      filters: { weeks, cities, stores },
      kpis: {
        totalGMV,
        totalOrders,
        aov: aov.toFixed(2),
        adsSpendFradiavolo,
        adsSpendGlovo,
        roas: roas.toFixed(2),
        percentCost: percentCost.toFixed(2),
        deliveryTimeAvg: deliveryTimeAvg.toFixed(1),
        avgRating: avgRating.toFixed(1)
      },
      stores: storesRanking,
      timeSeries,
      ads: {
        cofund: {
          budget: 100000,
          spent: data.ads.slice(1)
            .filter(r => {
              const w = dateToISOWeek(r[COL.ADS.WEEK]);
              return w && w >= '2025-W25' && w <= '2026-W25';
            })
            .reduce((sum, r) => sum + parseNumber(r[COL.ADS.ADS_GLOVO]), 0),
          startWeek: '2025-W25',
          endWeek: '2026-W25'
        },
        byPlacement: adsFiltered.reduce((acc, r) => {
          const placement = r[COL.ADS.PLACEMENT] || 'Unknown';
          if (!acc[placement]) {
            acc[placement] = { spend: 0, gmvGenerate: 0, impressions: 0, clicks: 0, conversions: 0 };
          }
          acc[placement].spend += parseNumber(r[COL.ADS.ADS_GLOVO]) + parseNumber(r[COL.ADS.ADS_FDV]);
          acc[placement].gmvGenerate += parseNumber(r[COL.ADS.GMV]);
          acc[placement].impressions += parseInt(r[COL.ADS.IMPRESSIONS]) || 0;
          acc[placement].clicks += parseInt(r[COL.ADS.CLICKS]) || 0;
          acc[placement].conversions += parseInt(r[COL.ADS.CONVERSIONS]) || 0;
          return acc;
        }, {}),
        byWeek: data.ads.slice(1).reduce((acc, r) => {
          const weekISO = dateToISOWeek(r[COL.ADS.WEEK]);
          if (!weekISO) return acc;
          if (!acc[weekISO]) {
            acc[weekISO] = { spendFradiavolo: 0, spendGlovo: 0, spendTotal: 0 };
          }
          const spendFdv = parseNumber(r[COL.ADS.ADS_FDV]);
          const spendGlv = parseNumber(r[COL.ADS.ADS_GLOVO]);
          acc[weekISO].spendFradiavolo += spendFdv;
          acc[weekISO].spendGlovo += spendGlv;
          acc[weekISO].spendTotal += spendFdv + spendGlv;
          return acc;
        }, {}),
        byStore: adsFiltered.reduce((acc, r) => {
          const said = r[COL.ADS.SAID];
          if (!STORE_MAPPING[said]) return acc;
          if (!acc[said]) {
            acc[said] = {
              name: STORE_MAPPING[said].name,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              spendTotal: 0,
              spendFradiavolo: 0,
              gmvGenerate: 0
            };
          }
          acc[said].impressions += parseInt(r[COL.ADS.IMPRESSIONS]) || 0;
          acc[said].clicks += parseInt(r[COL.ADS.CLICKS]) || 0;
          acc[said].conversions += parseInt(r[COL.ADS.CONVERSIONS]) || 0;
          acc[said].spendFradiavolo += parseNumber(r[COL.ADS.ADS_FDV]);
          acc[said].spendTotal += parseNumber(r[COL.ADS.ADS_FDV]) + parseNumber(r[COL.ADS.ADS_GLOVO]);
          acc[said].gmvGenerate += parseNumber(r[COL.ADS.GMV]);
          return acc;
        }, {}),
        byCityAndPlacement: (() => {
          const cityPlacementData = {};
          
          adsFiltered.forEach(r => {
            const said = r[COL.ADS.SAID];
            if (!STORE_MAPPING[said]) return;
            
            const city = STORE_MAPPING[said].city;
            const placement = r[COL.ADS.PLACEMENT] || 'Unknown';
            const spendFdv = parseNumber(r[COL.ADS.ADS_FDV]);
            const spendGlv = parseNumber(r[COL.ADS.ADS_GLOVO]);
            const gmv = parseNumber(r[COL.ADS.GMV]);
            
            if (!cityPlacementData[city]) {
              cityPlacementData[city] = {};
            }
            
            if (!cityPlacementData[city][placement]) {
              cityPlacementData[city][placement] = {
                city,
                placement,
                spendTotal: 0,
                spendFradiavolo: 0,
                spendGlovo: 0,
                gmvGenerate: 0,
                impressions: 0,
                clicks: 0,
                conversions: 0
              };
            }
            
            cityPlacementData[city][placement].spendFradiavolo += spendFdv;
            cityPlacementData[city][placement].spendGlovo += spendGlv;
            cityPlacementData[city][placement].spendTotal += spendFdv + spendGlv;
            cityPlacementData[city][placement].gmvGenerate += gmv;
            cityPlacementData[city][placement].impressions += parseInt(r[COL.ADS.IMPRESSIONS]) || 0;
            cityPlacementData[city][placement].clicks += parseInt(r[COL.ADS.CLICKS]) || 0;
            cityPlacementData[city][placement].conversions += parseInt(r[COL.ADS.CONVERSIONS]) || 0;
          });
          
          return cityPlacementData;
        })()
      },
      promo: {
        totalSpesaPromoFradiavolo: totalProductPromoByPartner,
        percentPromo: percentPromoKPI.toFixed(2),
        trendData: promoTrendData
      },
      ops: {
        avgRating: opsMetrics.avgRating.toFixed(2),
        avgDeliveryTime: opsMetrics.avgDeliveryTime.toFixed(1),
        avgWMI: opsMetrics.avgWMI.toFixed(2),
        avgUptime: opsMetrics.avgUptime.toFixed(1),
        storeTable: opsStoreTable,
        ratingTimeSeries: opsRatingTimeSeries,
        deliveryTimeTimeSeries: opsDeliveryTimeTimeSeries,
        wmiTimeSeries: opsWMITimeSeries
      },
      items: {
        totalQuantity: itemsMetrics.totalQuantity,
        totalRevenue: itemsMetrics.totalRevenue,
        topProduct: itemsMetrics.topProduct,
        topProductQty: itemsMetrics.topProductQty,
        top10Products: itemsTop10,
        timeSeries: itemsTimeSeries,
        byProduct: itemsByProductFormatted
      },
      analysis: analysisInsights
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}
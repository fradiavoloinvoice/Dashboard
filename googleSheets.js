import { google } from 'googleapis';

// ✅ Cache system (5 minuti TTL)
const cacheGlovo = { data: null, timestamp: null, TTL: 5 * 60 * 1000 };
const cacheDeliveroo = { data: null, timestamp: null, TTL: 5 * 60 * 1000 };
const cacheJustEat = { data: null, timestamp: null, TTL: 5 * 60 * 1000 };
const cacheFatturato = { data: null, timestamp: null, TTL: 5 * 60 * 1000 };
const cacheRecensioni = { data: null, timestamp: null, TTL: 5 * 60 * 1000 };
const cacheSondaggio = { data: null, timestamp: null, TTL: 5 * 60 * 1000 };

/**
 * Helper per convertire array di righe in array di oggetti
 */
function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  
  const headers = rows[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g, '_'));
  
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

/**
 * ✅ DATI GLOVO
 * Fogli: ADS, OPS, ORDERS, PROMO, ITEMS GLOVO
 */
export async function getGlovoSheetsData() {
  if (cacheGlovo.data && cacheGlovo.timestamp && (Date.now() - cacheGlovo.timestamp < cacheGlovo.TTL)) {
    console.log(`📦 Glovo Cache HIT (age: ${Math.floor((Date.now() - cacheGlovo.timestamp) / 1000)}s)`);
    return cacheGlovo.data;
  }

  console.log('🔄 Fetching Glovo data from Google Sheets...');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const [adsRes, opsRes, ordersRes, promoRes, itemsRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'ADS!A:N' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'OPS!A:O' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'ORDERS!A:G' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'PROMO!A:H' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'ITEMS GLOVO!A:E' })
    ]);

    const data = {
      ads: adsRes.data.values || [],
      ops: opsRes.data.values || [],
      orders: ordersRes.data.values || [],
      promo: promoRes.data.values || [],
      items: itemsRes.data.values || []
    };

    cacheGlovo.data = data;
    cacheGlovo.timestamp = Date.now();

    console.log('✅ Glovo data cached');
    return data;
  } catch (error) {
    console.error('❌ Error fetching Glovo Sheets:', error);
    throw error;
  }
}

/**
 * ✅ DATI DELIVEROO (nuovo)
 * Fogli: MARKETING DELIVEROO, OPS DELIVEROO
 */
export async function getDeliverooSheetsData() {
  if (cacheDeliveroo.data && cacheDeliveroo.timestamp && (Date.now() - cacheDeliveroo.timestamp < cacheDeliveroo.TTL)) {
    console.log(`📦 Deliveroo Cache HIT (age: ${Math.floor((Date.now() - cacheDeliveroo.timestamp) / 1000)}s)`);
    return cacheDeliveroo.data;
  }

  console.log('🔄 Fetching Deliveroo data from Google Sheets...');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const [marketingRes, opsRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'MARKETING DELIVEROO!A:Z' }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'OPS DELIVEROO!A:Z' })
    ]);

    const data = {
      marketing: rowsToObjects(marketingRes.data.values || []),
      ops: rowsToObjects(opsRes.data.values || [])
    };

    cacheDeliveroo.data = data;
    cacheDeliveroo.timestamp = Date.now();

    console.log('✅ Deliveroo data cached:', {
      marketing: data.marketing.length,
      ops: data.ops.length
    });
    return data;
  } catch (error) {
    console.error('❌ Error fetching Deliveroo Sheets:', error);
    throw error;
  }
}

/**
 * ✅ DATI JUST EAT
 * Foglio: Just eat
 */
export async function getJustEatSheetsData() {
  if (cacheJustEat.data && cacheJustEat.timestamp && (Date.now() - cacheJustEat.timestamp < cacheJustEat.TTL)) {
    console.log(`📦 Just Eat Cache HIT (age: ${Math.floor((Date.now() - cacheJustEat.timestamp) / 1000)}s)`);
    return cacheJustEat.data;
  }

  console.log('🔄 Fetching Just Eat data from Google Sheets...');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Just eat!A:P'
    });

    const data = rowsToObjects(response.data.values || []);

    cacheJustEat.data = data;
    cacheJustEat.timestamp = Date.now();

    console.log('✅ Just Eat data cached:', { rows: data.length });
    return data;
  } catch (error) {
    console.error('❌ Error fetching Just Eat Sheets:', error);
    throw error;
  }
}

/**
 * ✅ DATI FATTURATO
 * Foglio: Foglio1
 */
export async function getFatturatoSheetsData() {
  if (cacheFatturato.data && cacheFatturato.timestamp && (Date.now() - cacheFatturato.timestamp < cacheFatturato.TTL)) {
    console.log(`📦 Fatturato Cache HIT (age: ${Math.floor((Date.now() - cacheFatturato.timestamp) / 1000)}s)`);
    return cacheFatturato.data;
  }

  console.log('🔄 Fetching Fatturato data from Google Sheets...');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_FATTURATO_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Foglio1!A:S' // 19 colonne (A-S)
    });

    const data = {
      fatturato: response.data.values || []
    };

    cacheFatturato.data = data;
    cacheFatturato.timestamp = Date.now();

    console.log('✅ Fatturato data cached:', { rows: data.fatturato.length });
    return data;
  } catch (error) {
    console.error('❌ Error fetching Fatturato Sheets:', error);
    throw error;
  }
}

/**
 * ✅ DATI RECENSIONI (Piattaforme: Glovo, Deliveroo, etc.)
 * Spreadsheet: 1J6IXtd_pK1NgF1epVM4LPt7zhbZNzJ3RTmWxCceOiec
 * Foglio: Sheet 1 (index 0)
 */
export async function getRecensioniSheetsData() {
  if (cacheRecensioni.data && cacheRecensioni.timestamp && (Date.now() - cacheRecensioni.timestamp < cacheRecensioni.TTL)) {
    console.log(`📦 Recensioni Cache HIT (age: ${Math.floor((Date.now() - cacheRecensioni.timestamp) / 1000)}s)`);
    return cacheRecensioni.data;
  }

  console.log('🔄 Fetching Recensioni data from Google Sheets...');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_RECENSIONI_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Foglio1!A:Z'
    });

    const rows = response.data.values || [];

    // Converti in array di oggetti con header normalizzati
    const data = rowsToObjects(rows);

    cacheRecensioni.data = data;
    cacheRecensioni.timestamp = Date.now();

    console.log('✅ Recensioni data cached:', { rows: data.length });
    return data;
  } catch (error) {
    console.error('❌ Error fetching Recensioni Sheets:', error);
    throw error;
  }
}

/**
 * ✅ DATI SONDAGGIO
 * Spreadsheet: 1J6IXtd_pK1NgF1epVM4LPt7zhbZNzJ3RTmWxCceOiec
 * Foglio: Sheet 2 (index 1)
 */
export async function getSondaggioSheetsData() {
  if (cacheSondaggio.data && cacheSondaggio.timestamp && (Date.now() - cacheSondaggio.timestamp < cacheSondaggio.TTL)) {
    console.log(`📦 Sondaggio Cache HIT (age: ${Math.floor((Date.now() - cacheSondaggio.timestamp) / 1000)}s)`);
    return cacheSondaggio.data;
  }

  console.log('🔄 Fetching Sondaggio data from Google Sheets...');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_RECENSIONI_ID;

    // Prima otteniamo i metadati per scoprire il nome del secondo foglio
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    });

    const sheetNames = metadata.data.sheets.map(s => s.properties.title);
    console.log('📋 Fogli disponibili:', sheetNames);

    // Usa il secondo foglio (index 1)
    const secondSheetName = sheetNames[1] || 'Sheet2';
    console.log(`📋 Usando foglio sondaggio: "${secondSheetName}"`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${secondSheetName}'!A:Z`
    });

    const rows = response.data.values || [];

    // Converti in array di oggetti con header normalizzati
    const data = rowsToObjects(rows);

    cacheSondaggio.data = data;
    cacheSondaggio.timestamp = Date.now();

    console.log('✅ Sondaggio data cached:', { rows: data.length });
    return data;
  } catch (error) {
    console.error('❌ Error fetching Sondaggio Sheets:', error);
    throw error;
  }
}
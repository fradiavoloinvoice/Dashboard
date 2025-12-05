import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getAllData as getGlovoData } from './glovoController.js';
import { getFatturatoData, getHeatmapWeeklyData } from './fatturatoController.js';
import { getDeliverooData } from './deliverooController.js';
import { getCombinedData } from './combinedController.js';
import { getUnifiedData } from './unifiedController.js';
import { getRecensioniData, getSondaggioData, getRecensioniByStore, getNpsRanking, getUnderperformingStores, getDeliveryComparison } from './recensioniController.js';
import { getDeliveryReport } from './deliveryReportController.js';
import { getJustEatData } from './justeatController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Serve static files from root directory
app.use(express.static('.'));

// ✅ GLOVO ENDPOINT
app.get('/api/glovo', getGlovoData);

// ✅ DELIVEROO ENDPOINT
app.get('/api/deliveroo', getDeliverooData);

// ✅ JUST EAT ENDPOINT
app.get('/api/justeat', getJustEatData);

// ✅ FATTURATO ENDPOINT
app.get('/api/fatturato', getFatturatoData);

// ✅ HEATMAP WEEKLY ENDPOINT (Delta Budget e Delta Anno per store/settimana)
app.get('/api/heatmap-weekly', getHeatmapWeeklyData);

// ✅ COMBINED ENDPOINT (Glovo + Deliveroo)
app.get('/api/combined', getCombinedData);

// ✅ UNIFIED ENDPOINT (Glovo + Deliveroo + Fatturato - Vista completa per store)
app.get('/api/unified', getUnifiedData);

// ✅ RECENSIONI ENDPOINT
app.get('/api/recensioni', getRecensioniData);

// ✅ SONDAGGIO ENDPOINT
app.get('/api/sondaggio', getSondaggioData);

// ✅ RECENSIONI PER STORE (aggregato)
app.get('/api/recensioni/store/:storeName', getRecensioniByStore);

// ✅ NPS RANKING
app.get('/api/nps-ranking', getNpsRanking);

// ✅ UNDERPERFORMING STORES (alert)
app.get('/api/underperforming', getUnderperformingStores);

// ✅ DELIVERY COMPARISON (Glovo vs Deliveroo)
app.get('/api/delivery-comparison', getDeliveryComparison);

// ✅ DELIVERY REPORT (Report costi per store/settimana)
app.get('/api/delivery-report', getDeliveryReport);

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/glovo',
      '/api/deliveroo',
      '/api/justeat',
      '/api/fatturato',
      '/api/combined',
      '/api/unified',
      '/api/recensioni',
      '/api/sondaggio'
    ]
  });
});

app.listen(PORT, () => {
  console.log('🍕 Fradiavolo Dashboard Backend');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Glovo API: http://localhost:${PORT}/api/glovo`);
  console.log(`📊 Deliveroo API: http://localhost:${PORT}/api/deliveroo`);
  console.log(`🍔 Just Eat API: http://localhost:${PORT}/api/justeat`);
  console.log(`💰 Fatturato API: http://localhost:${PORT}/api/fatturato`);
  console.log(`📊 Combined API: http://localhost:${PORT}/api/combined`);
  console.log(`🎯 Unified API: http://localhost:${PORT}/api/unified`);
  console.log(`⭐ Recensioni API: http://localhost:${PORT}/api/recensioni`);
  console.log(`📋 Sondaggio API: http://localhost:${PORT}/api/sondaggio`);
  console.log(`📋 Delivery Report API: http://localhost:${PORT}/api/delivery-report`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
});
import express from 'express';
import cors from 'cors';
import dashboardRouter from './routes/dashboard';
import casesRouter from './routes/cases';
import vendorsRouter from './routes/vendors';
import reportsRouter from './routes/reports';
import assistantRouter from './routes/assistant';
import { getSeedData } from './seed/index';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/cases', casesRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/assistant', assistantRouter);

// Health check
app.get('/api/health', (_req, res) => {
  const { stats } = getSeedData();
  res.json({ status: 'ok', stats });
});

// Ingestion simulation endpoint
app.post('/api/ingest', (_req, res) => {
  const { stats } = getSeedData();
  setTimeout(() => {
    res.json({
      success: true,
      processed: stats.totalTenders,
      vendors: stats.totalVendors,
      bids: stats.totalBids,
      flagged: stats.flaggedCount,
      duration: '2.4s',
    });
  }, 2000);
});

// Warm up seed data on startup
console.log('[Server] Warming up seed data...');
getSeedData();

app.listen(PORT, () => {
  console.log(`[Server] TenderLens API running on http://localhost:${PORT}`);
});

export default app;

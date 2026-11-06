import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';
import dstRoutes from './routes/dstRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/dst', dstRoutes);
app.use('/api/search', searchRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    message: 'AMDDST Dialogue State Tracking API is operational.',
    endpoints: {
      health: 'GET /api/health',
      dstPredict: 'POST /api/dst/predict',
      search: 'POST /api/search',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AMDDST Backend] Running on http://localhost:${PORT}`);
});

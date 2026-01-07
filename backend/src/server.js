import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
import authRoutes from './routes/authRoutes.js';

app.use('/api/auth', authRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'LioArcade API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      content: '/api/content',
      gamification: '/api/gamification',
      admin: '/api/admin',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});

export default app;


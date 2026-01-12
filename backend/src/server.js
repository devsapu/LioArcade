import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import userRoutes from './routes/userRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/user', userRoutes);

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
import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);

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


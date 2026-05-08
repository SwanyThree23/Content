import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { initializeServices } from './config/services';

// Routes
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import webhooksRoutes from './routes/webhooks';
import stripeRoutes from './routes/stripe';
import streamingRoutes from './routes/streaming';
import documentsRoutes from './routes/documents';
import adminRoutes from './routes/admin';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Stripe webhook needs raw body — mount before json parser
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  socket.on('message', (data) => io.emit('message', data));
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: { message: err.message || 'Internal server error' } });
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 5000;

async function startServer() {
  await initializeServices();
  httpServer.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => { console.error('Startup failed:', err); process.exit(1); });

export { app, io };

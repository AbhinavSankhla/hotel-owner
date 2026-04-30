'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const { validateEnv, env } = require('./config/env');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const routes = require('./routes');

// ── Validate env vars before anything else ──────────────────────────────────
validateEnv();

const app = express();

// ── Security & Utility Middleware ────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-hotel-id', 'x-api-key'],
    credentials: true,
    maxAge: 86400,
  })
);

app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Raw body for Razorpay webhook signature verification ─────────────────────
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

// ── JSON & URL-encoded body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static files — serve uploaded images ────────────────────────────────────
// Security headers prevent browsers from executing uploaded files as scripts
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'");
  // Block directory traversal in URL
  if (req.path.includes('..') || req.path.includes('%2e')) {
    return res.status(400).json({ success: false, message: 'Invalid path' });
  }
  next();
}, express.static(path.join(__dirname, env.UPLOAD_DIR), {
  index: false,         // no directory listing
  dotfiles: 'deny',     // no hidden files
}));

// ── Global rate limiting ─────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Service status tracking ──────────────────────────────────────────────────
const serviceStatus = { db: false, redis: false };

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const healthy = serviceStatus.db && serviceStatus.redis;
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    message: healthy ? 'All services healthy' : 'Some services degraded',
    data: {
      uptime: process.uptime(),
      db: serviceStatus.db ? 'connected' : 'disconnected',
      redis: serviceStatus.redis ? 'connected' : 'disconnected',
    },
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
});

// ── Global error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  try {
    // Connect DB first (may fall back to pg-mem in dev)
    await connectDatabase();
    serviceStatus.db = true;

    // Connect Redis (may fall back to ioredis-mock in dev)
    await connectRedis();
    serviceStatus.redis = true;

    const server = app.listen(env.PORT, () => {
      console.log(`[Server] Hotel API running on http://localhost:${env.PORT}`);
      console.log(`[Server] Environment: ${env.NODE_ENV}`);
      console.log(`[Server] Health: http://localhost:${env.PORT}/health`);
    });

    const shutdown = (signal) => {
      console.log(`\n[Server] ${signal} received — shutting down gracefully`);
      server.close(() => process.exit(0));
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Fatal startup error:', error.message);
    process.exit(1);
  }
}

bootstrap();

module.exports = app;


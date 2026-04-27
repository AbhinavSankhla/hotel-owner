'use strict';

const Redis = require('ioredis');
const { env } = require('./env');

// ── Initialize Redis at load time so destructuring works in services ─────────
// Dev: always use ioredis-mock (no Redis install required)
// Prod: use real Redis; server refuses to start if unavailable

let redis;
let usingMockRedis = false;

if (env.NODE_ENV !== 'production') {
  const RedisMock = require('ioredis-mock');
  redis = new RedisMock();
  usingMockRedis = true;
} else {
  redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    db: env.REDIS_DB || 0,
    lazyConnect: true,
    retryStrategy: (times) => (times > 5 ? null : Math.min(times * 500, 3000)),
  });
  if (env.REDIS_PASSWORD) redis.options.password = env.REDIS_PASSWORD;
  redis.on('connect', () => console.log('[Redis] Connected successfully'));
  redis.on('error', (err) => console.error('[Redis] Error:', err.message));
}

async function connectRedis() {
  if (usingMockRedis) {
    console.log('[Redis] Using ioredis-mock (in-memory) — data resets on restart');
    return;
  }
  await redis.connect();
  console.log('[Redis] Real Redis connected');
}

module.exports = { redis, usingMockRedis, connectRedis };



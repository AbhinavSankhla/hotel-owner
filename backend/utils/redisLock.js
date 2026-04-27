'use strict';

const LOCK_TTL_MS = 30000; // 30 seconds

/**
 * Acquire a distributed lock via Redis SET NX PX.
 * @param {Redis} redis
 * @param {string} key  - Lock key (e.g. "booking_lock:hotelId:roomTypeId")
 * @param {number} ttl  - TTL in milliseconds
 * @returns {string|null} lockValue if acquired, null if already locked
 */
async function acquireLock(redis, key, ttl = LOCK_TTL_MS) {
  const lockValue = `lock:${Date.now()}:${Math.random()}`;
  const result = await redis.set(key, lockValue, 'PX', ttl, 'NX');
  if (result === 'OK') return lockValue;
  return null;
}

/**
 * Release a lock only if the lockValue matches (prevents releasing another process's lock).
 */
async function releaseLock(redis, key, lockValue) {
  const current = await redis.get(key);
  if (current === lockValue) {
    await redis.del(key);
    return true;
  }
  return false;
}

module.exports = { acquireLock, releaseLock };

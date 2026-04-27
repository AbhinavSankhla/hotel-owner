'use strict';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { ApiKey, Hotel } = require('../models');
const { redis } = require('../config/redis');
const { createError } = require('../middlewares/errorHandler.middleware');

const API_KEY_CACHE_TTL = 300; // 5 minutes

class ApiKeyService {
  /** Generate a new API key. Returns plaintext key once — never stored. */
  async generateKey(hotelId, { name, allowedOrigins = [], permissions = {}, expiresAt = null }) {
    const plainKey = `hk_${uuidv4().replace(/-/g, '')}`;
    const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');

    const existing = await ApiKey.findOne({ where: { keyHash } });
    if (existing) throw createError('Key collision — please try again', 409);

    await ApiKey.create({ hotelId, name, keyHash, allowedOrigins, permissions, expiresAt });

    return { key: plainKey, message: 'Store this key safely — it will not be shown again' };
  }

  /** Validate an API key from the x-api-key header. Uses Redis cache. */
  async validateKey(plainKey, origin = null) {
    const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');
    const cacheKey = `apikey:${keyHash}`;

    let apiKey;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      apiKey = JSON.parse(cached);
    } else {
      const found = await ApiKey.findOne({ where: { keyHash, isActive: true } });
      if (!found) return null;
      apiKey = found.toJSON();
      await redis.set(cacheKey, JSON.stringify(apiKey), 'EX', API_KEY_CACHE_TTL).catch(() => {});
    }

    // Check expiry
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) return null;

    // Check origin
    if (apiKey.allowedOrigins?.length > 0 && origin) {
      if (!apiKey.allowedOrigins.includes(origin)) return null;
    }

    // Update lastUsedAt (fire and forget)
    ApiKey.update({ lastUsedAt: new Date() }, { where: { keyHash } }).catch(() => {});

    return apiKey;
  }

  async listKeys(hotelId) {
    return ApiKey.findAll({
      where: { hotelId },
      attributes: { exclude: ['keyHash'] },
      order: [['createdAt', 'DESC']],
    });
  }

  async revokeKey(keyId, hotelId) {
    const key = await ApiKey.findOne({ where: { id: keyId, hotelId } });
    if (!key) throw createError('API key not found', 404);
    await key.update({ isActive: false });
    await redis.del(`apikey:${key.keyHash}`).catch(() => {});
    return { message: 'API key revoked' };
  }
}

module.exports = new ApiKeyService();

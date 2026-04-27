'use strict';

const OTP_TTL_SECONDS = 300; // 5 minutes
const OTP_LENGTH = 6;

/** Generate a 6-digit numeric OTP */
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Store OTP in Redis with TTL. Key: otp:{phone} */
async function storeOTP(redis, phone, otp, ttl = OTP_TTL_SECONDS) {
  const key = `otp:${phone}`;
  await redis.set(key, otp, 'EX', ttl);
}

/** Verify OTP stored in Redis. Returns true if valid, false otherwise. */
async function verifyOTP(redis, phone, otp) {
  const key = `otp:${phone}`;
  const stored = await redis.get(key);
  return stored !== null && stored === String(otp);
}

/** Delete OTP from Redis after successful verification */
async function clearOTP(redis, phone) {
  await redis.del(`otp:${phone}`);
}

module.exports = { generateOTP, storeOTP, verifyOTP, clearOTP };

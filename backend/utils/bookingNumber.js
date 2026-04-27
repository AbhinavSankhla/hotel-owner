'use strict';

const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a human-readable, unique booking number.
 * Format: BK-YYYYMMDD-XXXX (e.g. BK-20260427-A3KP)
 */
function generate() {
  const date = dayjs().format('YYYYMMDD');
  const suffix = uuidv4().replace(/-/g, '').substring(0, 4).toUpperCase();
  return `BK-${date}-${suffix}`;
}

module.exports = { generate };

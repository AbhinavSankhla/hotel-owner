'use strict';

const { ValidationError: SequelizeValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require('sequelize');
const { env } = require('../config/env');

/**
 * Global Express error handler — must be the LAST middleware registered.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isDev = env.NODE_ENV === 'development';

  // Log all errors
  console.error(`[Error] ${req.method} ${req.originalUrl}`, {
    message: err.message,
    stack: isDev ? err.stack : undefined,
  });

  // ── Sequelize Validation Error ───────────────────────────────────────────
  if (err instanceof SequelizeValidationError) {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(422).json({
      success: false,
      message: 'Database validation failed',
      data: null,
      errors,
    });
  }

  // ── Unique Constraint Error ──────────────────────────────────────────────
  if (err instanceof UniqueConstraintError) {
    const fields = err.errors.map((e) => e.path).join(', ');
    return res.status(409).json({
      success: false,
      message: `Duplicate value for: ${fields}`,
      data: null,
    });
  }

  // ── Foreign Key Constraint ───────────────────────────────────────────────
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist',
      data: null,
    });
  }

  // ── Generic Database Error ───────────────────────────────────────────────
  if (err instanceof DatabaseError) {
    return res.status(500).json({
      success: false,
      message: 'Database error occurred',
      data: null,
    });
  }

  // ── JWT Errors ───────────────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired', data: null });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token', data: null });
  }

  // ── Custom application errors with statusCode ────────────────────────────
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  // ── Fallback 500 ─────────────────────────────────────────────────────────
  return res.status(500).json({
    success: false,
    message: isDev ? err.message : 'Internal server error',
    data: null,
    ...(isDev ? { stack: err.stack } : {}),
  });
}

/** Create a custom application error with a status code */
function createError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = { errorHandler, createError };

'use strict';

const { validationResult } = require('express-validator');
const { unprocessable } = require('../utils/response');

/**
 * Run after express-validator chains. Returns 422 with structured errors if validation fails.
 */
function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
      value: e.value,
    }));
    return unprocessable(res, errors);
  }
  return next();
}

module.exports = handleValidation;

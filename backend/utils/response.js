'use strict';

/**
 * Standard API response helpers.
 * Every endpoint uses: success(res, message, data)
 * Response envelope: { success, message, data }
 */

function success(res, message = 'Request successful', data = null, statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function created(res, message = 'Resource created successfully', data = null) {
  return success(res, message, data, 201);
}

function noContent(res) {
  return res.status(204).send();
}

function error(res, message = 'An error occurred', statusCode = 500, errors = null) {
  const body = { success: false, message, data: null };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

function notFound(res, message = 'Resource not found') {
  return error(res, message, 404);
}

function unauthorized(res, message = 'Unauthorized') {
  return error(res, message, 401);
}

function forbidden(res, message = 'Forbidden — insufficient permissions') {
  return error(res, message, 403);
}

function badRequest(res, message = 'Bad request', errors = null) {
  return error(res, message, 400, errors);
}

function conflict(res, message = 'Conflict — resource already exists') {
  return error(res, message, 409);
}

function unprocessable(res, errors, message = 'Validation failed') {
  return res.status(422).json({ success: false, message, data: null, errors });
}

module.exports = {
  success,
  created,
  noContent,
  error,
  notFound,
  unauthorized,
  forbidden,
  badRequest,
  conflict,
  unprocessable,
};

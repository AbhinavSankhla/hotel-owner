'use strict';

/**
 * Standard pagination helper for Sequelize queries.
 * @param {Object} Model  - Sequelize model
 * @param {Object} queryOptions - findAll options (where, include, order, etc.)
 * @param {number} page   - 1-based page number
 * @param {number} limit  - items per page (default 20, max 100)
 * @returns {Object} { data, total, page, limit, pages }
 */
async function paginate(Model, queryOptions = {}, page = 1, limit = 20) {
  const safePage = Math.max(1, parseInt(page, 10));
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (safePage - 1) * safeLimit;

  const { count, rows } = await Model.findAndCountAll({
    ...queryOptions,
    limit: safeLimit,
    offset,
    distinct: true, // Required when using include with has-many
  });

  return {
    data: rows,
    total: count,
    page: safePage,
    limit: safeLimit,
    pages: Math.ceil(count / safeLimit),
  };
}

/**
 * Extract pagination params from Express request query.
 * @returns {Object} { page, limit }
 */
function getPaginationParams(query) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  return { page, limit };
}

module.exports = { paginate, getPaginationParams };

const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require("../config/env");

/**
 * Parse and clamp pagination query parameters.
 */
function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  let limit = parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE;
  if (Number.isNaN(limit) || limit < 1) limit = DEFAULT_PAGE_SIZE;
  limit = Math.min(limit, MAX_PAGE_SIZE);
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { parsePagination };

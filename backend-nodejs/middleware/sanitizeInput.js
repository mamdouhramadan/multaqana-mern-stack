/**
 * Sanitize input to prevent NoSQL injection.
 * Strips keys that start with $ or contain . (Mongo operators / nested injection).
 */

/**
 * Recursively remove dangerous keys from an object (keys starting with $ or containing .)
 * @param {object} obj - Plain object (query or body)
 * @returns {object} - New object with dangerous keys removed
 */
function stripDangerousKeys(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripDangerousKeys);

  const out = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    out[key] = stripDangerousKeys(obj[key]);
  }
  return out;
}

/**
 * Middleware: sanitize req.query to prevent NoSQL injection in list/filter endpoints.
 * Use before any route that passes req.query to a query builder.
 */
const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    req.query = stripDangerousKeys(req.query);
  }
  next();
};

/**
 * Middleware: sanitize req.body to prevent NoSQL injection in update/create.
 * Strips $ and dot-notation keys so clients cannot pass e.g. { $set: { role: 'admin' } }.
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = stripDangerousKeys(req.body);
  }
  next();
};

module.exports = {
  sanitizeQuery,
  sanitizeBody,
  stripDangerousKeys
};

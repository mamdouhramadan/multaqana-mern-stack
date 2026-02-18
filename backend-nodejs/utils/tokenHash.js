const crypto = require('crypto');

/**
 * Hash a refresh token for secure storage in the database.
 * If the DB is leaked, plain tokens cannot be used.
 * @param {string} token - Plain JWT refresh token
 * @returns {string} - SHA-256 hash of the token
 */
function hashToken(token) {
  if (!token || typeof token !== 'string') return '';
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { hashToken };

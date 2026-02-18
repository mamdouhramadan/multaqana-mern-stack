const rateLimit = require('express-rate-limit');

const authMessage = { success: false, message: 'Too many attempts; please try again later.' };

/** Login: 5 attempts per 15 minutes (brute force protection) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: authMessage,
  standardHeaders: true,
  legacyHeaders: false
});

/** Registration: 3 per hour */
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: authMessage,
  standardHeaders: true,
  legacyHeaders: false
});

/** Password reset (forgot + reset): 3 per hour combined */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: authMessage,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, registrationLimiter, passwordResetLimiter };

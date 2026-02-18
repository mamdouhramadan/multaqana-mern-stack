/**
 * Operational error class for known, expected failures (e.g. not found, validation).
 * statusCode: HTTP status to send (400, 404, etc.).
 * isOperational: marks this as a trusted error; the central error handler uses it to send a safe response without leaking internals.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

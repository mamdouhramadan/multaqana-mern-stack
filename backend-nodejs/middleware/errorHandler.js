const { CODES, MSG_CODES } = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const logger = require('../config/logger');

/**
 * Central error-handling middleware.
 * Handles Mongoose errors, JSON parse errors, and AppError (operational errors).
 * Maps all errors to a single response shape: { success, code, message_code, message, data }.
 * Never sends the raw err object to the client (security; err may contain circular refs e.g. Socket).
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  logger.error('%s', (err.stack || err.message || err).toString?.() || String(err));

  let statusCode = res.statusCode === 200 ? (err.statusCode || err.status || 500) : res.statusCode;
  let message = err.message;
  let code = CODES.SERVER_ERROR;
  let msgCode = MSG_CODES.SERVER_ERROR;

  // AppError (operational errors from controllers/handlerFactory)
  if (err instanceof AppError || err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
    code = statusCode;
    if (statusCode === 400) {
      msgCode = MSG_CODES.VALIDATION_ERROR;
    } else if (statusCode === 401) {
      msgCode = MSG_CODES.AUTH_FAILED;
    } else if (statusCode === 403) {
      msgCode = MSG_CODES.ACCESS_DENIED;
    } else if (statusCode === 404) {
      msgCode = MSG_CODES.NOT_FOUND;
    } else if (statusCode === 409) {
      msgCode = MSG_CODES.CONFLICT;
    } else {
      msgCode = MSG_CODES.SERVER_ERROR;
    }
  }

  // JSON Parse Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON: ' + err.message;
    code = CODES.BAD_REQUEST;
    msgCode = MSG_CODES.VALIDATION_ERROR;
  }

  // Mongoose Bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
    code = CODES.NOT_FOUND;
    msgCode = MSG_CODES.NOT_FOUND;
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for field: ${field}. Please use another value.`;
    code = CODES.CONFLICT;
    msgCode = MSG_CODES.DUPLICATE;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    code = CODES.BAD_REQUEST;
    msgCode = MSG_CODES.VALIDATION_ERROR;
  }

  // Mongoose VersionError (concurrent save / optimistic locking)
  if (err.name === 'VersionError') {
    statusCode = 409;
    message = 'Resource was updated by another request. Please retry.';
    code = CODES.CONFLICT;
    msgCode = MSG_CODES.CONFLICT;
  }

  // Build a plain response object (never pass err itself — it can contain circular refs e.g. Socket).
  // Call apiResponse once only; it already sends the response (calling res.json(apiResponse(...)) would double-send and pass res as body → circular JSON).
  const payload = {
    success: statusCode >= 200 && statusCode < 300,
    code: code,
    message_code: msgCode,
    message: message,
    data: [],
    pagination: undefined
  };
  if (process.env.NODE_ENV !== 'production' && err.stack) payload.stack = err.stack;
  res.status(statusCode).json(payload);
};

module.exports = errorHandler;

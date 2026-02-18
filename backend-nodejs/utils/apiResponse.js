const { CODES, MSG_CODES } = require('../config/responseConstants');

/**
 * Standard API Response Builder
 * @param {Object} res - Express response object
 * @param {number} code - HTTP status code (default 200)
 * @param {string} messageCode - Machine readable code (default FETCH_SUCCESS)
 * @param {string} message - Human readable message
 * @param {Array|Object} data - Payload (default [])
 * @param {Object} pagination - Pagination metadata (optional)
 */
const apiResponse = (res, code = CODES.SUCCESS, messageCode = MSG_CODES.FETCH_SUCCESS, message = '', data = [], pagination = null) => {

  const response = {
    success: code >= 200 && code < 300,
    code: code,
    message_code: messageCode,
    message: message,
    data: data || [],
    pagination: pagination || undefined
  };

  return res.status(code).json(response);
};

module.exports = {
  apiResponse,
  CODES,
  MSG_CODES
};

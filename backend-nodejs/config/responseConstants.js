// HTTP Status Codes
const CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};

// Message Codes (Machine Readable)
const MSG_CODES = {
  // Success Types
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  UPDATE_SUCCESS: 'UPDATE_SUCCESS',
  DELETE_SUCCESS: 'DELETE_SUCCESS',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',

  // Error Types
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE: 'RESOURCE_DUPLICATE',
  CONFLICT: 'RESOURCE_CONFLICT',
  AUTH_FAILED: 'AUTHENTICATION_FAILED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCESS_DENIED: 'ACCESS_DENIED',
  SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UPLOAD_ERROR: 'FILE_UPLOAD_ERROR'
};

// Default Human Readable Messages
// You can use these or override them in the controller
const MESSAGES = {
  FETCH: 'Data retrieved successfully',
  CREATE: 'Resource created successfully',
  UPDATE: 'Resource updated successfully',
  DELETE: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
  INVALID_DATA: 'Invalid data received'
};

module.exports = {
  CODES,
  MSG_CODES,
  MESSAGES
};

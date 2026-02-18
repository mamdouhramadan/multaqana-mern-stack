const User = require('../models/User');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

/**
 * Middleware to restrict access by permission (resource:action).
 * Must be used after verifyJWT. Loads user's role and checks role.permissions.
 * @param {string} requiredPermission - e.g. 'news:create', 'users:read'
 */
const verifyPermission = (requiredPermission) => {
  return async (req, res, next) => {
    if (!req?.id) {
      return apiResponse(res, CODES.UNAUTHORIZED, MSG_CODES.AUTH_FAILED, 'Unauthorized');
    }
    const user = await User.findById(req.id).populate('role');
    if (!user?.role) {
      return apiResponse(res, CODES.FORBIDDEN, MSG_CODES.ACCESS_DENIED, 'No role assigned');
    }
    const permissions = user.role.permissions || [];
    if (!permissions.includes(requiredPermission)) {
      return apiResponse(res, CODES.FORBIDDEN, MSG_CODES.ACCESS_DENIED, `Permission required: ${requiredPermission}`);
    }
    req.role = user.role;
    req.permissions = permissions;
    next();
  };
};

module.exports = verifyPermission;

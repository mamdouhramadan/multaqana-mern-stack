// Middleware to restrict access based on user roles
// Why? Ensures only authorized personnel (e.g., Admin, Editor) can perform specific actions.
// Usage: verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor)
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // req.roles comes from verifyJWT middleware
    if (!req?.roles) return apiResponse(res, CODES.UNAUTHORIZED, MSG_CODES.ACCESS_DENIED, "You don't have permission to perform this action.");

    const rolesArray = [...allowedRoles];

    // check if user has at least one of the allowed roles
    // We map user roles to boolean (includes) and find if any is true
    const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true);

    if (!result) return apiResponse(res, CODES.FORBIDDEN, MSG_CODES.ACCESS_DENIED, "You don't have permission to perform this action. Required roles: " + rolesArray.map(r => Object.keys(require('../config/roles_list')).find(key => require('../config/roles_list')[key] === r)).join(', '));

    next();
  }
}

module.exports = verifyRoles;

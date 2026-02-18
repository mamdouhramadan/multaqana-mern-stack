const jwt = require('jsonwebtoken'); // Import library to handle JSON Web Tokens
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

// Middleware function to protect routes
// Why? This acts as a security guard. It stands before your protected routes (like 'get all employees').
// It checks if you have a valid ID card (Access Token).
// What if not exist? Anyone could access your sensitive API endpoints without logging in.
const verifyJWT = (req, res, next) => {
  // 1. Check for the Authorization header in the request
  // Frontend sends token like: "Bearer via..token..string..."
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // 2. Validate format: Must exist and start with "Bearer "
  // Why? "Bearer" is the standard schema for token auth.
  if (!authHeader?.startsWith('Bearer ')) {
    return apiResponse(res, CODES.UNAUTHORIZED, MSG_CODES.AUTH_FAILED, 'Unauthorized');
  }

  // 3. Extract the token itself (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  // 4. Verify the token using our secret key
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET, // The secret key used to sign the token. If this doesn't match, token is fake.
    (err, decoded) => {
      // Callback function runs after verification attempt

      // If error (token expired, tampered with, or wrong secret)
      if (err) return apiResponse(res, CODES.FORBIDDEN, MSG_CODES.ACCESS_DENIED, 'Forbidden');

      // If success:
      // Extract info from token and attach to the request object (req)
      // Why? So the NEXT function (the controller) knows WHO is making the request.
      req.user = decoded.UserInfo.username;
      req.roles = decoded.UserInfo.roles;
      req.id = decoded.UserInfo.id;

      next(); // Move to the next middleware or controller
    }
  );
}

module.exports = verifyJWT;

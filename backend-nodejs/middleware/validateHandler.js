const { validationResult } = require('express-validator'); // Get the function to extract validation errors

const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

// Middleware to handle the result of our validation checks
// Why? We define checks in the route (e.g. "email must be valid"), but those checks don't stop the request automatically.
// They just attach a list of errors to the 'req' object.
// This function LOOKS at that list. If it finds errors, it stops the request and sends them back to the user.
// What if not exist? Even if you send an invalid email, the controller would still try to run, likely crashing or saving bad data.
const validateHandler = (req, res, next) => {
  const errors = validationResult(req); // Extract validation errors from the request

  // If there are errors (list is not empty)
  if (!errors.isEmpty()) {
    // Stop here! Return 400 (Bad Request) with the list of errors.
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Validation Failed', errors.array());
  }

  // If no errors, proceed to the controller
  next();
};

module.exports = validateHandler;

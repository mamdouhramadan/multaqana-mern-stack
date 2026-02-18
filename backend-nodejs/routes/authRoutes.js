const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { signupValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validator/auth.validator');
const { uploadImage } = require('../middleware/uploadMiddleware');
const { registrationLimiter, passwordResetLimiter } = require('../config/rateLimiters');

// Define Routes
// Why? This file maps URL endpoints (e.g. /register) to the specific functions that handle them.
// Think of this as the menu in a restaurant.

// Route: POST /auth/register
// Purpose: Create a new user account
// Steps:
// 1. uploadImage('image', 'users'): Handles upload & resize, saving to public/img/users
// 2. signupValidator: Validates input
// 3. authController.registerUser: Run logic
router.post('/register',
  registrationLimiter,
  ...uploadImage('image', 'users'),
  signupValidator,
  authController.registerUser
);

// Route: POST /auth/login
// Purpose: Authenticate user and issue tokens
router.post('/login',
  loginValidator,
  authController.login
);

// Route: GET /auth/refresh
// Purpose: Get a new Access Token using the Refresh Token (from cookie)
// Why GET? Because we are "getting" a new token, not creating a resource, though POST is also common.
router.get('/refresh', authController.refresh);

// Route: POST /auth/logout
// Purpose: Clear the refresh token cookie
router.post('/logout', authController.logout);

// Route: POST /auth/forgot-password
// Purpose: Send password reset link to email
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidator, authController.forgotPassword);

// Route: POST /auth/reset-password/:token
// Purpose: Reset password using token from email
router.post('/reset-password/:token', passwordResetLimiter, resetPasswordValidator, authController.resetPassword);

// Route: GET /auth/verify-email/:token
// Purpose: Verify email using token from verification email
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router;

const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcrypt'); // Library to hash passwords securely
const jwt = require('jsonwebtoken'); // Library to create and verify tokens
const User = require('../models/User');
const Role = require('../models/Role');
const ROLES_LIST = require('../config/roles_list');
const sendEmail = require('../utils/sendEmail'); // Import our email helper
const crypto = require('crypto');
const { hashToken } = require('../utils/tokenHash');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');
const logger = require('../config/logger');

/** Build roles array for JWT: from user.role (populated) map slug to ROLES_LIST code; else fallback to legacy user.roles */
function getRolesForJWT(user) {
  if (user.role && typeof user.role === 'object' && user.role.slug) {
    const code = ROLES_LIST[user.role.slug.charAt(0).toUpperCase() + user.role.slug.slice(1)];
    if (code != null) return [code];
  }
  return Object.values(user.roles || {}).filter(Boolean);
}

// @desc Register a new user
// @route POST /auth/register
// @access Public (Anyone can register)
const registerUser = catchAsync(async (req, res) => {
  // 1. Extract data from the request body
  const {
    username,
    email,
    password,
    phoneNumber,
    age,
    address,
    emiratesId,
    employeeCode,
    department,
    position,
    joiningDate,
    jobTitle,
    manager,
    contractType,
    dateOfBirth,
    gender,
    nationality,
    emergencyContact,
    personalEmail,
    language
  } = req.body;

  // 2. Check if the user already exists
  // Why? Duplicate emails would break login logic.
  const duplicate = await User.findOne({ email }).exec();
  if (duplicate) {
    logger.debug('registerUser: duplicate email');
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Email already registered');
  }

  // Check for duplicate employee code if provided
  if (employeeCode) {
    const duplicateCode = await User.findOne({ employeeCode }).exec();
    if (duplicateCode) {
      logger.debug('registerUser: duplicate employeeCode');
      return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Employee Code already exists');
    }
  }

  // 3. Hash the password
  // Why? NEVER save passwords in plain text. If the DB is hacked, users are compromised.
  // '10' is the salt rounds (complexity). Higher is safer but slower.
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create user object to save
  const userObject = {
    username,
    email,
    password: hashedPassword,
    phoneNumber,
    age,
    // Address comes as a JSON string if sent via FormData (which we assume due to image upload), so parse it.
    // We use a try-catch to handle cases where it's already an object or a simple non-JSON string.
    address: (() => {
      if (typeof address === 'string') {
        try {
          return JSON.parse(address);
        } catch (error) {
          return address; // Return as string if parse fails (let Mongoose validate it)
        }
      }
      return address;
    })(),
    emiratesId,
    employeeCode,
    department,
    position,
    joiningDate,
    jobTitle,
    manager,
    contractType,
    dateOfBirth,
    gender,
    nationality,
    emergencyContact: typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact,
    personalEmail,
    language,
    // If an image was uploaded, save the path. Otherwise empty string.
    image: req.file ? `/img/users/${req.file.filename}` : ""
  };

  const defaultRole = await Role.findOne({ isDefault: true });
  if (defaultRole) userObject.role = defaultRole._id;

  // 5. Save to Database
  const user = await User.create(userObject);

  if (user) {
    logger.info('User registered: %s', user.email);

    // Email verification token (hashed in DB; 24h expiry)
    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = hashToken(verifyToken);
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verifyToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to Multaqana - Verify your email',
        message: `Hi ${user.username},\n\nWelcome to Multaqana! Please verify your email by clicking the link below (valid for 24 hours):\n\n${verifyUrl}\n\nIf you did not create an account, please ignore this email.\n\nBest,\nMultaqana Team`
      });
      logger.debug('Verification email sent to %s', user.email);
    } catch (emailError) {
      logger.warn('Failed to send verification email: %s', emailError.message);
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    // Auto-login: Generate tokens (derive from role ref if populated)
    const userWithRole = await User.findById(user._id).populate('role', 'slug').lean();
    const roles = getRolesForJWT(userWithRole);

    // Access Token: Short-lived (15m), used for API requests
    const accessToken = jwt.sign(
      {
        "UserInfo": {
          "username": user.username,
          "roles": roles,
          "id": user._id
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    // Refresh Token: Long-lived (7d), used to get new Access Tokens
    const refreshToken = jwt.sign(
      { "username": user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Save hashed Refresh Token in DB (plain token never stored)
    user.refreshToken = [hashToken(refreshToken)];
    await user.save();

    // Send Refresh Token as HttpOnly Cookie
    // Note: sameSite 'None' requires secure:true, so use 'Lax' in development
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return apiResponse(res, CODES.CREATED, MSG_CODES.CREATED, `New user ${username} created`, { accessToken });
  } else {
    logger.warn('registerUser: user creation returned falsy');
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.INVALID_DATA, 'Invalid user data received');
  }
});

// ...

// @desc Login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;



  // ...

  // 2. Find the user by email (populate role for JWT)
  const foundUser = await User.findOne({ email }).populate('role', 'slug').exec();

  if (foundUser) {
    // Check if user is active, etc.
  }

  // 3. User not found or inactive? Unauthorized.
  if (!foundUser || !foundUser.active) {
    return apiResponse(res, CODES.UNAUTHORIZED, MSG_CODES.USER_NOT_FOUND, 'User not found or inactive');
  }

  // 4. Check password
  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) return apiResponse(res, CODES.UNAUTHORIZED, MSG_CODES.INVALID_CREDENTIALS, 'Invalid password');

  // 4b. Update last login
  foundUser.lastLogin = new Date();
  await foundUser.save({ validateBeforeSave: false });

  // 5. Generate Tokens (derive from role ref or legacy user.roles)
  const roles = getRolesForJWT(foundUser);

  // Access Token: Short-lived (15m), used for API requests. Contains checks (roles).
  // Security: If stolen, it expires quickly.
  const accessToken = jwt.sign(
    {
      "UserInfo": {
        "username": foundUser.username,
        "roles": roles,
        "id": foundUser._id
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh Token: Long-lived (7d), used only to get new Access Tokens.
  // Why? Allows user to stay logged in without entering password every 15 mins.
  const refreshToken = jwt.sign(
    { "username": foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  // 6. Save hashed Refresh Token to Current User in DB
  foundUser.refreshToken = [...foundUser.refreshToken, hashToken(refreshToken)];
  await foundUser.save();

  // 7. Send Refresh Token as a Cookie
  // HttpOnly: JavaScript cannot read this cookie. Prevents XSS attacks stealing the token.
  // Secure: Sent only over HTTPS (in production).
  // SameSite: 'None' requires secure:true, so use 'Lax' in development
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });

  // 8. Send Access Token as JSON
  // Client (React/Next.js) will store this in memory/state and attach it to API calls.
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.AUTH_SUCCESS, 'Login successful', { accessToken });
});

// Helper: send 200 with accessToken null (avoids 401/403 in console; frontend treats as "not logged in")
const sendNoSession = (res) => apiResponse(res, CODES.SUCCESS, MSG_CODES.AUTH_FAILED, 'No session', { accessToken: null });

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = catchAsync(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return sendNoSession(res);

  const refreshToken = cookies.jwt;
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('jwt', { httpOnly: true, sameSite: isProduction ? 'None' : 'Lax', secure: isProduction });

  const hashedToken = hashToken(refreshToken);
  const foundUser = await User.findOne({ refreshToken: hashedToken }).populate('role', 'slug').exec();
  if (!foundUser) {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (!err && decoded?.username) {
        await User.updateOne({ username: decoded.username }, { $set: { refreshToken: [] } });
      }
    });
    return sendNoSession(res);
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== hashedToken);
  const userId = foundUser._id;

  return new Promise((resolve) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err || foundUser.username !== decoded?.username) {
          await User.updateOne({ _id: userId }, { $set: { refreshToken: newRefreshTokenArray } });
          return resolve(sendNoSession(res));
        }
        const roles = getRolesForJWT(foundUser);
        const accessToken = jwt.sign(
          { "UserInfo": { "username": foundUser.username, "roles": roles, "id": foundUser._id } },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '15m' }
        );
        const newRefreshToken = jwt.sign(
          { "username": foundUser.username },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' }
        );
        const updatedTokens = [...newRefreshTokenArray, hashToken(newRefreshToken)];
        await User.updateOne({ _id: userId }, { $set: { refreshToken: updatedTokens } });
        res.cookie('jwt', newRefreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'None' : 'Lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return resolve(apiResponse(res, CODES.SUCCESS, MSG_CODES.AUTH_SUCCESS, 'Token Refreshed', { accessToken }));
      }
    );
  });
});

// @desc Forgot password - send reset link to email
// @route POST /auth/forgot-password
// @access Public
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).exec();
  // Always return same message to avoid user enumeration
  const message = 'If an account exists with this email, you will receive a password reset link.';

  if (!user) {
    return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, message, []);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(resetToken);
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Multaqana - Password Reset',
      message: `Hi ${user.username},\n\nYou requested a password reset. Click the link below (valid for 10 minutes):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nBest,\nMultaqana Team`
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return apiResponse(res, CODES.SERVER_ERROR, MSG_CODES.SERVER_ERROR, 'Failed to send reset email. Try again later.', []);
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, message, []);
});

// @desc Reset password using token from email
// @route POST /auth/reset-password/:token
// @access Public
const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || password !== confirmPassword) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Password and confirmation do not match', []);
  }

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).exec();

  if (!user) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.INVALID_DATA, 'Invalid or expired reset token', []);
  }

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = [];
  await user.save();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, 'Password reset successful. Please log in.', []);
});

// @desc Verify email using token from verification email
// @route GET /auth/verify-email/:token
// @access Public
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  const hashedToken = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  }).exec();

  if (!user) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.INVALID_DATA, 'Invalid or expired verification token', []);
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, 'Email verified successfully.', []);
});

// @desc Change password for current user (must know current password); clears all refresh tokens
// @route PATCH /api/users/me/change-password
// @access Private
const changeMyPassword = catchAsync(async (req, res) => {
  const userId = req.id;
  const { currentPassword, password } = req.body;

  const user = await User.findById(userId).select('+password');
  if (!user) {
    return apiResponse(res, CODES.UNAUTHORIZED, MSG_CODES.AUTH_FAILED, 'User not found');
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return apiResponse(res, CODES.UNAUTHORIZED, MSG_CODES.INVALID_CREDENTIALS, 'Current password is incorrect');
  }

  user.password = await bcrypt.hash(password, 10);
  user.refreshToken = [];
  await user.save();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, 'Password changed. Please log in again.', []);
});

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = catchAsync(async (req, res) => {
  // 1. Check for cookie
  const cookies = req.cookies;
  if (!cookies?.jwt) return apiResponse(res, CODES.SUCCESS, MSG_CODES.LOGOUT_SUCCESS, 'No cookie to clear');

  const refreshToken = cookies.jwt;
  const hashedToken = hashToken(refreshToken);

  // 2. Is (hashed) refreshToken in db?
  const foundUser = await User.findOne({ refreshToken: hashedToken }).exec();
  if (!foundUser) {
    // If no user found, just clear the cookie anyway.
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('jwt', { httpOnly: true, sameSite: isProduction ? 'None' : 'Lax', secure: isProduction });
    return apiResponse(res, CODES.SUCCESS, MSG_CODES.LOGOUT_SUCCESS, 'Cookie cleared');
  }

  // 3. Delete ONLY the current (hashed) refreshToken from db (Log out of this device only)
  foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== hashedToken);
  await foundUser.save();

  // 4. Clear cookie
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('jwt', { httpOnly: true, sameSite: isProd ? 'None' : 'Lax', secure: isProd });
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.LOGOUT_SUCCESS, 'Cookie cleared');
});

module.exports = {
  registerUser,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changeMyPassword
};

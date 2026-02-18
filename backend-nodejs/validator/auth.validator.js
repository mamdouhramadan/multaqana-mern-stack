const { check } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');
const User = require('../models/User');

exports.signupValidator = [
    check('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters')
        .isLength({ max: 30 })
        .withMessage('Username must be at most 30 characters'),

    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom(async (val) => {
            // Purpose: Check if the email already exists in the database
            // Why? To ensure that every user has a unique email address to avoid conflicts during login.
            const user = await User.findOne({ email: val });
            if (user) {
                return Promise.reject('E-mail already in use');
            }
        }),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .custom((password, { req }) => {
            // Purpose: Ensure the password matches the confirmation field
            // Why? To prevent typos when setting a password.
            if (password !== req.body.confirmPassword) {
                throw new Error('Password Confirmation incorrect');
            }
            return true;
        }),

    check('confirmPassword')
        .notEmpty()
        .withMessage('Password does not match'), // Just checking it exists, logic above handles matching

    check('phoneNumber')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA', 'ar-AE'])
        .withMessage('Invalid phone number only accepted EG, SA and AE Phone numbers'),

    validateHandler,
];

exports.loginValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),
    // Note: We do NOT check if email exists here to avoid "User Enumeration" attacks.
    // If we return "Email not found", attackers know who is registered.

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    validateHandler,
];

exports.forgotPasswordValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),
    validateHandler,
];

exports.resetPasswordValidator = [
    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .custom((password, { req }) => {
            if (password !== req.body.confirmPassword) {
                throw new Error('Password confirmation does not match');
            }
            return true;
        }),
    check('confirmPassword')
        .notEmpty()
        .withMessage('Confirm password is required'),
    validateHandler,
];

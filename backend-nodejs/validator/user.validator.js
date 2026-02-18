const { check, body } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');
const User = require('../models/User');
const Role = require('../models/Role');
const Department = require('../models/Department');
const Position = require('../models/Position');
const bcrypt = require('bcrypt');

exports.createUserValidator = [
    check('username')
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),

    check('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom(async (val) => {
            // Purpose: Check uniqueness of email during user creation (by Admin)
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
            // Purpose: Validate that password and confirmation match
            if (password !== req.body.confirmPassword) {
                throw new Error('Password Confirmation incorrect');
            }
            return true;
        }),

    check('confirmPassword')
        .notEmpty()
        .withMessage('Password confirmation is required'),

    check('phoneNumber')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA', 'ar-AE'])
        .withMessage('Invalid phone number only accepted EG, SA and AE Phone numbers'),

    check('roles')
        .optional(),

    check('joiningDate')
        .optional()
        .isISO8601()
        .withMessage('Joining Date must be a valid date'),

    check('contractType')
        .optional()
        .isIn(['Full-time', 'Part-time', 'Contract'])
        .withMessage('Invalid contract type'),

    check('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of Birth must be a valid date'),

    check('gender')
        .optional()
        .isIn(['Male', 'Female'])
        .withMessage('Gender must be Male or Female'),

    check('personalEmail')
        .optional()
        .isEmail()
        .withMessage('Invalid personal email format'),

    check('language')
        .optional()
        .isIn(['en', 'ar'])
        .withMessage('Invalid language selection'),

    validateHandler,
];

exports.getUserValidator = [
    // Purpose: Ensure the ID passed in the URL is a valid MongoDB ObjectId
    check('id').isMongoId().withMessage('Invalid User ID format'),
    validateHandler,
];

exports.updateUserValidator = [
    check('id').isMongoId().withMessage('Invalid User ID format'),
    check('username')
        .optional()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),

    check('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email address')
        .custom(async (val) => {
            // Purpose: Ensure new email doesn't conflict with another user (unique check on update)
            const user = await User.findOne({ email: val });
            if (user) {
                return Promise.reject('E-mail already in use');
            }
        }),

    check('phoneNumber')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA', 'ar-AE'])
        .withMessage('Invalid phone number only accepted EG, SA and AE Phone numbers'),

    check('joiningDate')
        .optional()
        .isISO8601()
        .withMessage('Joining Date must be a valid date'),

    check('contractType')
        .optional()
        .isIn(['Full-time', 'Part-time', 'Contract'])
        .withMessage('Invalid contract type'),

    check('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of Birth must be a valid date'),

    check('gender')
        .optional()
        .isIn(['Male', 'Female'])
        .withMessage('Gender must be Male or Female'),

    check('personalEmail')
        .optional()
        .isEmail()
        .withMessage('Invalid personal email format'),

    check('language')
        .optional()
        .isIn(['en', 'ar'])
        .withMessage('Invalid language selection'),

    body('role')
        .optional()
        .isMongoId()
        .withMessage('Invalid role ID format')
        .custom(async (roleId) => {
            if (!roleId) return true;
            const role = await Role.findById(roleId);
            if (!role) return Promise.reject('Role not found');
            return true;
        }),

    body('department')
        .optional({ values: 'falsy' })
        .isMongoId()
        .withMessage('Invalid department ID format')
        .custom(async (departmentId) => {
            if (!departmentId) return true;
            const department = await Department.findById(departmentId);
            if (!department) return Promise.reject('Department not found');
            return true;
        }),

    body('position')
        .optional({ values: 'falsy' })
        .isMongoId()
        .withMessage('Invalid position ID format')
        .custom(async (positionId) => {
            if (!positionId) return true;
            const position = await Position.findById(positionId);
            if (!position) return Promise.reject('Position not found');
            return true;
        }),

    validateHandler,
];

exports.deleteUserValidator = [
    check('id').isMongoId().withMessage('Invalid User ID format'),

    validateHandler,
];

exports.changePasswordValidator = [
    check('id').isMongoId().withMessage('Invalid User ID format'),
    body('currentPassword')
        .notEmpty()
        .withMessage('You must enter your current password'),
    body('passwordConfirm')
        .notEmpty()
        .withMessage('You must enter the password confirm'),
    body('password')
        .notEmpty()
        .withMessage('You must enter new password')
        .custom(async (val, { req }) => {
            // Purpose: Securely verify the old password before allowing a change
            const user = await User.findById(req.params.id);
            if (!user) {
                throw new Error('There is no user for this id');
            }
            const isCorrectPassword = await bcrypt.compare(
                req.body.currentPassword,
                user.password
            );
            if (!isCorrectPassword) {
                throw new Error('Incorrect current password');
            }
            if (val !== req.body.passwordConfirm) {
                throw new Error('Password Confirmation incorrect');
            }
            return true;
        }),
    validateHandler,
];

// For PATCH /users/me/change-password (current user; id from JWT)
exports.changeMyPasswordValidator = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('password')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .custom((val, { req }) => {
            if (val !== req.body.passwordConfirm) {
                throw new Error('Password confirmation does not match');
            }
            return true;
        }),
    body('passwordConfirm')
        .notEmpty()
        .withMessage('Password confirmation is required'),
    validateHandler,
];

exports.updateLoggedUserValidator = [
    body('username')
        .optional()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email address')
        .custom(async (email) => {
            // Purpose: Check email uniqueness when user updates their own profile
            const user = await User.findOne({ email });
            if (user) {
                return Promise.reject('E-mail already in use');
            }
        }),
    check('phoneNumber')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA', 'ar-AE'])
        .withMessage('Invalid phone number only accepted EG, SA and AE Phone numbers'),

    check('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of Birth must be a valid date'),

    check('gender')
        .optional()
        .isIn(['Male', 'Female'])
        .withMessage('Gender must be Male or Female'),

    check('personalEmail')
        .optional()
        .isEmail()
        .withMessage('Invalid personal email format'),

    check('language')
        .optional()
        .isIn(['en', 'ar'])
        .withMessage('Invalid language selection'),

    validateHandler,
];
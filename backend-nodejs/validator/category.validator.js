const { check, body } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');
const Category = require('../models/Category');

exports.getCategoryValidator = [
    // Purpose: Ensure the ID is a valid MongoDB ObjectId format
    // Why? To prevent invalid IDs from being passed to the database query, which could cause errors or security issues.
    check('id').isMongoId().withMessage('Invalid Category ID format'),
    validateHandler,
];

exports.createCategoryValidator = [
    // Purpose: Ensure the title is a non-empty string with a minimum length of 3 characters and a maximum length of 32 characters
    // Why? To prevent creating categories with empty or very short/long titles, which could cause display issues or data corruption.
    check('title')
        .notEmpty()
        .withMessage('Category title is required')
        .isLength({ min: 3 })
        .withMessage('Too short category title')
        .isLength({ max: 32 })
        .withMessage('Too long category title')
        .custom(async (title) => {
            // Purpose: Prevent Creating duplicate category with same name
            const category = await Category.findOne({ title });
            if (category) {
                return Promise.reject('Category already exists');
            }
        }),
    check('module')
        .notEmpty()
        .withMessage('Module is required')
        .isIn(['news', 'magazine', 'faq', 'video', 'album', 'event', 'general'])
        .withMessage('Invalid module type'),
    validateHandler,
];

exports.updateCategoryValidator = [
    // Purpose: Ensure the ID is a valid MongoDB ObjectId format
    // Why? To prevent invalid IDs from being passed to the database query, which could cause errors or security issues.
    check('id').isMongoId().withMessage('Invalid Category ID format'),
    body('title')
        .optional()
        .custom(async (title) => {
            // Purpose: Check if new title is already taken by another category
            const category = await Category.findOne({ title });
            if (category) {
                return Promise.reject('Category already exists');
            }
        }),
    check('module')
        .optional()
        .isIn(['news', 'magazine', 'faq', 'video', 'album', 'event', 'general'])
        .withMessage('Invalid module type'),
    validateHandler,
];

exports.deleteCategoryValidator = [
    // Purpose: Ensure the ID is a valid MongoDB ObjectId format
    // Why? To prevent invalid IDs from being passed to the database query, which could cause errors or security issues.
    check('id').isMongoId().withMessage('Invalid Category ID format'),
    validateHandler,
];
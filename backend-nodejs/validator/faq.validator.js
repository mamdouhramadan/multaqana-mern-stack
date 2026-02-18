const { check, body } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');
const FAQ = require('../models/FAQ');

exports.getFAQValidator = [
  check('id').isMongoId().withMessage('Invalid FAQ ID'),
  validateHandler,
];

exports.createFAQValidator = [
  check('title')
    .notEmpty()
    .withMessage('Question (title) is required')
    .trim(),

  check('description')
    .notEmpty()
    .withMessage('Answer (description) is required'),

  check('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid Category ID'),

  validateHandler,
];

exports.updateFAQValidator = [
  check('id').isMongoId().withMessage('Invalid FAQ ID'),
  body('title').optional().trim(),
  body('description').optional(),
  validateHandler,
];

exports.deleteFAQValidator = [
  check('id').isMongoId().withMessage('Invalid FAQ ID'),
  validateHandler,
];

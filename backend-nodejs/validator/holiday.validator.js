const { check } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');

exports.getHolidayValidator = [
  check('id').isMongoId().withMessage('Invalid Holiday ID'),
  validateHandler,
];

exports.createHolidayValidator = [
  check('name').notEmpty().withMessage('Name is required'),
  // Purpose: Standardize date format for correct scheduling checks
  check('date').notEmpty().withMessage('Date is required').isISO8601().toDate(),
  check('isRecurring').optional().isBoolean(),
  validateHandler,
];

exports.updateHolidayValidator = [
  check('id').isMongoId().withMessage('Invalid Holiday ID'),
  check('name').optional(),
  check('date').optional().isISO8601().toDate(),
  validateHandler,
];

exports.deleteHolidayValidator = [
  check('id').isMongoId().withMessage('Invalid Holiday ID'),
  validateHandler,
];

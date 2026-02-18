const { check, body } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');

exports.getLeaveRequestValidator = [
  check('id').isMongoId().withMessage('Invalid Leave Request ID'),
  validateHandler,
];

exports.createLeaveRequestValidator = [
  check('type')
    .notEmpty()
    .withMessage('Leave type is required')
    .isIn(['Annual', 'Sick', 'Unpaid'])
    .withMessage('Invalid leave type'),

  check('startDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Start Date is required'),

  check('endDate')
    .notEmpty()
    .isISO8601()
    .withMessage('End Date is required'),

  // Purpose: Prevent negative or zero leave days
  check('daysCount')
    .isFloat({ min: 0.5 })
    .withMessage('Days count must be at least 0.5'),

  validateHandler,
];

exports.updateLeaveRequestValidator = [
  check('id').isMongoId().withMessage('Invalid Leave Request ID'),
  body('status')
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected']),
  validateHandler,
];

exports.deleteLeaveRequestValidator = [
  check('id').isMongoId().withMessage('Invalid Leave Request ID'),
  validateHandler,
];

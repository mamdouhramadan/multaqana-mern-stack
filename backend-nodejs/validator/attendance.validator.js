const { check } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');

exports.getAttendanceValidator = [
  check('id').isMongoId().withMessage('Invalid Attendance ID'),
  validateHandler,
];

exports.createAttendanceValidator = [
  check('user').isMongoId().withMessage('Invalid User ID'),

  // Purpose: Ensure date is stored in ISO format for consistent querying
  check('date').notEmpty().withMessage('Date is required').isISO8601().toDate(),

  check('status')
    .optional()
    .isIn(['Present', 'Absent', 'Late', 'Leave', 'PublicHoliday', 'Weekend'])
    .withMessage('Invalid Status'),
  validateHandler,
];

exports.updateAttendanceValidator = [
  check('id').isMongoId().withMessage('Invalid Attendance ID'),
  check('status')
    .optional()
    .isIn(['Present', 'Absent', 'Late', 'Leave', 'PublicHoliday', 'Weekend'])
    .withMessage('Invalid Status'),
  validateHandler,
];

exports.deleteAttendanceValidator = [
  check('id').isMongoId().withMessage('Invalid Attendance ID'),
  validateHandler,
];

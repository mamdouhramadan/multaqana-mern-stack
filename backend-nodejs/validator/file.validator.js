const { check } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');

exports.getFileValidator = [
  check('id').isMongoId().withMessage('Invalid File ID'),
  validateHandler,
];

exports.createFileValidator = [
  check('title').notEmpty().withMessage('Title is required'),
  // Purpose: Ensure valid relationship with Category if provided
  check('category').optional().isMongoId().withMessage('Invalid Category ID'),
  validateHandler,
];

exports.updateFileValidator = [
  check('id').isMongoId().withMessage('Invalid File ID'),
  check('title').optional(),
  validateHandler,
];

exports.deleteFileValidator = [
  check('id').isMongoId().withMessage('Invalid File ID'),
  validateHandler,
];

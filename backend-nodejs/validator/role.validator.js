const { check, body } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');

exports.getRoleValidator = [
  check('id').isMongoId().withMessage('Invalid Role ID format'),
  validateHandler,
];

exports.createRoleValidator = [
  body('name').notEmpty().trim().withMessage('Role name is required').isLength({ max: 64 }).withMessage('Name too long'),
  body('slug').optional().trim().isLength({ max: 64 }).withMessage('Slug too long'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('permissions.*').optional().isString().withMessage('Each permission must be a string'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean'),
  validateHandler,
];

exports.updateRoleValidator = [
  check('id').isMongoId().withMessage('Invalid Role ID format'),
  body('name').optional().trim().isLength({ max: 64 }).withMessage('Name too long'),
  body('slug').optional().trim().isLength({ max: 64 }).withMessage('Slug too long'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('permissions.*').optional().isString().withMessage('Each permission must be a string'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean'),
  validateHandler,
];

exports.deleteRoleValidator = [
  check('id').isMongoId().withMessage('Invalid Role ID format'),
  validateHandler,
];

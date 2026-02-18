const { check } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');

exports.getNewsValidator = [
  check('id').isMongoId().withMessage('Invalid News ID'),
  validateHandler,
];

exports.createNewsValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 })
    .withMessage('Title too short'),

  check('content')
    .notEmpty()
    .withMessage('Content is required'),

  validateHandler,
];

exports.updateNewsValidator = [
  check('id').isMongoId().withMessage('Invalid News ID'),
  check('title').optional().isLength({ min: 3 }),
  check('content').optional(),
  validateHandler,
];

exports.deleteNewsValidator = [
  check('id').isMongoId().withMessage('Invalid News ID'),
  validateHandler,
];

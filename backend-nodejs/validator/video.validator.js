const { check, body } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');

exports.getVideoValidator = [
  check('id').isMongoId().withMessage('Invalid Video ID'),
  validateHandler,
];

exports.createVideoValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3 }),

  check('videoType')
    .notEmpty()
    .isIn(['file', 'url'])
    .withMessage('Invalid Video Type (Must be file or url)'),

  // Purpose: Conditional validation. Only check videoUrl if videoType is 'url'.
  // If videoType is 'file', the file is handled by upload middleware.
  body('videoUrl')
    .if(body('videoType').equals('url'))
    .notEmpty()
    .withMessage('Video URL is required for type URL')
    .isURL()
    .withMessage('Invalid Video URL'),

  validateHandler,
];

exports.updateVideoValidator = [
  check('id').isMongoId().withMessage('Invalid Video ID'),
  check('title').optional(),
  validateHandler,
];

exports.deleteVideoValidator = [
  check('id').isMongoId().withMessage('Invalid Video ID'),
  validateHandler,
];

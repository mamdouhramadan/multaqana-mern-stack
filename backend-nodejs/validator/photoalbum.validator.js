const { check } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');

exports.getPhotoAlbumValidator = [
  check('id').isMongoId().withMessage('Invalid Album ID'),
  validateHandler,
];

exports.createPhotoAlbumValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title is required'),

  // Purpose: Link album to a valid category ID in MongoDB
  check('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid Category ID'),

  validateHandler,
];

exports.updatePhotoAlbumValidator = [
  check('id').isMongoId().withMessage('Invalid Album ID'),
  check('title').optional(),
  validateHandler,
];

exports.deletePhotoAlbumValidator = [
  check('id').isMongoId().withMessage('Invalid Album ID'),
  validateHandler,
];

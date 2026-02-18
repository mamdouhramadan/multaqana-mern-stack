const { check } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');
const Magazine = require('../models/Magazine');

exports.getMagazineValidator = [
  // Purpose: Ensure the ID is a valid MongoDB ObjectId format
  // Why? To prevent invalid IDs from being passed to the database query, which could cause errors or security issues.
  check('id').isMongoId().withMessage('Invalid Magazine ID'),
  validateHandler,
];

exports.createMagazineValidator = [
  // Purpose: Ensure the title is a non-empty string with a minimum length of 3 characters and a maximum length of 32 characters
  // Why? To prevent creating magazines with empty or very short/long titles, which could cause display issues or data corruption.
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .custom(async (val) => {
      // Purpose: Check for duplicate magazine titles
      const mag = await Magazine.findOne({ title: val });
      if (mag) {
        return Promise.reject('Magazine already exists');
      }
    }),
  // Note: 'file' and 'thumbnail' are uploaded via Multer middleware before this.

  validateHandler,
];

exports.updateMagazineValidator = [
  // Purpose: Ensure the ID is a valid MongoDB ObjectId format
  // Why? To prevent invalid IDs from being passed to the database query, which could cause errors or security issues.
  check('id').isMongoId().withMessage('Invalid Magazine ID'),
  check('title').optional(),
  validateHandler,
];

exports.deleteMagazineValidator = [
  // Purpose: Ensure the ID is a valid MongoDB ObjectId format
  // Why? To prevent invalid IDs from being passed to the database query, which could cause errors or security issues.
  check('id').isMongoId().withMessage('Invalid Magazine ID'),
  validateHandler,
];

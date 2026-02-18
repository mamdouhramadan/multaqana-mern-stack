const { check, body } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');
const Position = require('../models/Position');

exports.getPositionValidator = [
  check('id').isMongoId().withMessage('Invalid Position ID'),
  validateHandler,
];

exports.createPositionValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .custom(async (val) => {
      // Purpose: Ensure unique job position titles in the organization
      const pos = await Position.findOne({ title: val });
      if (pos) {
        return Promise.reject('Position already exists');
      }
    }),
  validateHandler,
];

exports.updatePositionValidator = [
  check('id').isMongoId().withMessage('Invalid Position ID'),
  body('title')
    .optional()
    .custom(async (val) => {
      // Purpose: Ensure uniqueness on update as well
      const pos = await Position.findOne({ title: val });
      if (pos) {
        return Promise.reject('Position already exists');
      }
    }),
  validateHandler,
];

exports.deletePositionValidator = [
  check('id').isMongoId().withMessage('Invalid Position ID'),
  validateHandler,
];

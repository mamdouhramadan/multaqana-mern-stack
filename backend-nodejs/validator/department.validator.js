const { check, body } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');
const Department = require('../models/Department');

exports.getDepartmentValidator = [
  check('id').isMongoId().withMessage('Invalid Department ID'),
  validateHandler,
];

exports.createDepartmentValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .custom(async (val) => {
      // Purpose: Prevent duplicate Department names
      const dept = await Department.findOne({ title: val });
      if (dept) {
        return Promise.reject('Department already exists');
      }
    }),
  validateHandler,
];

exports.updateDepartmentValidator = [
  check('id').isMongoId().withMessage('Invalid Department ID'),
  body('title')
    .optional()
    .custom(async (val) => {
      // Purpose: Prevent duplicate Department names on update
      const dept = await Department.findOne({ title: val });
      if (dept) {
        return Promise.reject('Department already exists');
      }
    }),
  validateHandler,
];

exports.deleteDepartmentValidator = [
  check('id').isMongoId().withMessage('Invalid Department ID'),
  validateHandler,
];

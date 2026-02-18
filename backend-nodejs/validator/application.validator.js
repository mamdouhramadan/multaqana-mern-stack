const { check, body } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');
const Application = require('../models/Application');

exports.getApplicationValidator = [
  check('id').isMongoId().withMessage('Invalid Application ID'),
  validateHandler,
];

exports.createApplicationValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .custom(async (val) => {
      // Purpose: Ensure unique application titles
      const app = await Application.findOne({ title: val });
      if (app) {
        return Promise.reject('Application with this title already exists');
      }
    }),
  check('platform')
    .notEmpty()
    .withMessage('Platform is required')
    .isIn(['ios', 'android', 'huawei'])
    .withMessage('Invalid platform (Must be ios, android, or huawei)'),

  check('storeName').notEmpty().withMessage('Store Name is required'),
  check('storeUrl').notEmpty().withMessage('Store URL is required').isURL().withMessage('Invalid URL'),
  check('url').notEmpty().withMessage('App URL is required').isURL().withMessage('Invalid URL'),
  check('department').optional().isMongoId().withMessage('Invalid Department ID'),

  validateHandler,
];

exports.updateApplicationValidator = [
  check('id').isMongoId().withMessage('Invalid Application ID'),
  body('title')
    .optional()
    .custom(async (val) => {
      // Purpose: Check for duplicates when updating title
      const app = await Application.findOne({ title: val });
      if (app) {
        return Promise.reject('Application with this title already exists');
      }
    }),
  body('platform')
    .optional()
    .isIn(['ios', 'android', 'huawei'])
    .withMessage('Invalid platform'),
  body('storeUrl').optional().isURL().withMessage('Invalid URL'),
  body('url').optional().isURL().withMessage('Invalid URL'),
  validateHandler,
];

exports.deleteApplicationValidator = [
  check('id').isMongoId().withMessage('Invalid Application ID'),
  validateHandler,
];

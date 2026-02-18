const { check, body, param } = require('express-validator');
const validateHandler = require('../middleware/validateHandler');

exports.createConversationValidator = [
  body('recipientId')
    .notEmpty().withMessage('Recipient ID is required')
    .isMongoId().withMessage('Invalid Recipient ID format'),
  validateHandler,
];

exports.getMessagesValidator = [
  param('conversationId')
    .notEmpty().withMessage('Conversation ID is required')
    .isMongoId().withMessage('Invalid Conversation ID format'),
  validateHandler,
];

exports.muteUserValidator = [
  param('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid User ID format'),
  validateHandler,
];

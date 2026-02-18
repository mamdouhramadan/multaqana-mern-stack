const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const verifyJWT = require('../middleware/verifyJWT');

const {
  createConversationValidator,
  getMessagesValidator,
  muteUserValidator
} = require('../validator/chat.validator');

router.use(verifyJWT);

router.get('/users', chatController.getChatUsers);

router.route('/conversations')
  .get(chatController.getConversations)
  .post(createConversationValidator, chatController.getOrCreateConversation);

router.route('/messages/:conversationId')
  .get(getMessagesValidator, chatController.getMessages);

router.route('/mute/:userId')
  .patch(muteUserValidator, chatController.toggleMuteUser);

module.exports = router;

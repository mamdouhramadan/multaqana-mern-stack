const catchAsync = require('../utils/catchAsync');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

// @desc    Get list of users for starting a chat (with online status)
// @route   GET /api/chat/users
// @access  Private
const getChatUsers = catchAsync(async (req, res) => {
  const currentUserId = req.id;

  const users = await User.find({ _id: { $ne: currentUserId }, active: true })
    .select('_id username image')
    .sort({ username: 1 })
    .lean();

  const onlineIds = new Set();
  if (req.io && req.io.socketToUserId) {
    for (const uid of req.io.socketToUserId.values()) {
      onlineIds.add(uid.toString());
    }
  }

  const usersWithStatus = users.map(u => ({
    _id: u._id,
    username: u.username,
    image: u.image,
    online: onlineIds.has(u._id.toString())
  }));

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, 'Users retrieved', { users: usersWithStatus });
});

// @desc    Get user conversations
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const conversations = await Conversation.find({ participants: req.id })
    .populate('participants', 'username image active')
    .populate('lastMessage', 'content sender createdAt attachments')
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // Faster query

  const total = await Conversation.countDocuments({ participants: req.id });

  // Format response to include unread count for the current user
  // Note: .lean() returns unreadCounts as plain object; without lean it would be a Map
  const data = conversations.map(conv => {
    const unreadCount = conv.unreadCounts
      ? (typeof conv.unreadCounts.get === 'function'
          ? conv.unreadCounts.get(req.id)
          : conv.unreadCounts[String(req.id)])
        || 0
      : 0;
    return { ...conv, unreadCount };
  });

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, 'Conversations retrieved', {
    conversations: data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get messages for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const cursor = req.query.cursor; // Use ID-based cursor for highly efficient pagination

  // Ensure user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.id
  });

  if (!conversation) {
    return apiResponse(res, CODES.FORBIDDEN, MSG_CODES.ACCESS_DENIED, 'Access denied or conversation not found');
  }

  // Reset unread count for this user
  if (conversation.unreadCounts && conversation.unreadCounts.get(req.id) > 0) {
    conversation.unreadCounts.set(req.id, 0);
    await conversation.save();
  }

  // Query Strategy: Cursor based on _id (or createdAt)
  let query = { conversationId };

  if (cursor) {
    query._id = { $lt: cursor }; // Fetch older messages
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'username image')
    .populate('replyTo', 'content sender')
    .lean();

  const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, 'Messages retrieved', {
    messages,
    nextCursor // Client sends this as ?cursor=nextCursor to get older messages
  });
});

// @desc    Mute/Unmute a user
// @route   PATCH /api/chat/mute/:userId
// @access  Private
const toggleMuteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const currentUser = await User.findById(req.id);

  if (currentUser.mutedUsers.includes(userId)) {
    // Unmute
    currentUser.mutedUsers = currentUser.mutedUsers.filter(id => id.toString() !== userId);
    await currentUser.save();
    return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, 'User unmuted');
  } else {
    // Mute
    currentUser.mutedUsers.push(userId);
    await currentUser.save();
    return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, 'User muted');
  }
});

// @desc    Start/Get conversation with a user
// @route   POST /api/chat/conversations
// @access  Private
const getOrCreateConversation = catchAsync(async (req, res) => {
  const { recipientId } = req.body;

  if (!recipientId) return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.MISSING_FIELDS, 'Recipient ID required');

  // Check if conversation exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.id, recipientId], $size: 2 },
    isGroup: false
  });

  if (conversation) {
    return apiResponse(res, CODES.SUCCESS, MSG_CODES.SUCCESS, 'Conversation found', { conversationId: conversation._id });
  }

  // Create new
  conversation = await Conversation.create({
    participants: [req.id, recipientId],
    unreadCounts: {
      [req.id]: 0,
      [recipientId]: 0
    }
  });

  return apiResponse(res, CODES.CREATED, MSG_CODES.CREATED, 'Conversation created', { conversationId: conversation._id });
});

module.exports = {
  getChatUsers,
  getConversations,
  getMessages,
  toggleMuteUser,
  getOrCreateConversation
};

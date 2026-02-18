const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true // Crucial for fetching chat history quickly
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    // Content might be empty if it's just an attachment, handled by validation logic if needed
  },
  attachments: [{
    type: String // URL to file/image
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message' // Self-reference for threaded replies
  },
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: { type: String } // e.g., "👍", "❤️", "😂"
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // createdAt is indexed by default in many setups, but explicit index is safer for cursor pagination
});

// Index for pagination: Get messages for a conversation, sorted by time
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

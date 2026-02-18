const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Indexed for fast lookup of "My Conversations"
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true // Indexed for sorting conversations by recency
  },
  // Map to store unread counts per user: e.g., { "userId1": 2, "userId2": 0 }
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to help find 1-on-1 conversations quickly
// conversationSchema.index({ participants: 1 }); 

module.exports = mongoose.model('Conversation', conversationSchema);

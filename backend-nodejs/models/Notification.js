const mongoose = require('mongoose');

/**
 * Notification Schema
 * Stores alerts and updates for users.
 * Used for both persistent history and real-time triggers.
 * 
 * Fields:
 * - user: Reference to the User receiving the notification. 
 *         If null, could be treated as a broadcast (depending on implementation logic).
 * - title: Short header for the notification (e.g., "New Message").
 * - description: Detailed body text (e.g., "User X sent you a message...").
 * - category: Type of notification (e.g., 'System', 'Alert', 'Message', 'Task').
 * - isRead: Status of the notification. Default: false.
 * - link: Optional URL to redirect the user to when clicked.
 * - data: Additional JSON payload (metadata) for frontend usage/routing.
 */
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must belong to a user'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'System',
    enum: ['System', 'Alert', 'Message', 'Application', 'Task', 'Reminder'],
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  link: {
    type: String,
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Extra metadata (e.g., { objectId: '123', action: 'approve' })
    default: {}
  }
}, {
  timestamps: true, // CreatedAt is useful for sorting by newest
  versionKey: false
});

module.exports = mongoose.model('Notification', notificationSchema);

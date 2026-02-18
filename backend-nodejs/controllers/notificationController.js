const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

/**
 * @desc    Get my notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getMyNotifications = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20; // Default 20
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ user: req.id }) // req.id from JWT
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ user: req.id });
  const unreadCount = await Notification.countDocuments({ user: req.id, isRead: false });

  res.json({
    success: true,
    data: notifications,
    meta: {
      page,
      limit,
      total,
      unreadCount,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * @desc    Create a notification (System/Admin) & Emit Real-time
 * @route   POST /api/notifications
 * @access  Private (Admin/System)
 */
const createNotification = catchAsync(async (req, res) => {
  const { userId, title, description, category, link, data } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ message: 'User ID and Title are required' });
  }

  const notification = await Notification.create({
    user: userId,
    title,
    description,
    category,
    link,
    data
  });

  // 🚀 Real-time Trigger
  // Emit to specific user room
  if (req.io) {
    req.io.to(userId).emit('new_notification', notification);
  }

  res.status(201).json({ success: true, data: notification });
});

/**
 * @desc    Mark as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, user: req.id });

  if (!notification) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  res.json({ success: true, data: notification });
});

/**
 * @desc    Mark ALL as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { user: req.id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOneAndDelete({ _id: id, user: req.id });

  if (!notification) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Notification not found');
  }

  res.json({ success: true, message: 'Notification removed' });
});

module.exports = {
  getMyNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

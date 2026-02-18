const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');

router.use(verifyJWT);

router.route('/')
  .get(notificationController.getMyNotifications)
  .post(verifyPermission('notifications:create'), notificationController.createNotification);

router.patch('/read-all', notificationController.markAllAsRead);

router.route('/:id')
  .delete(notificationController.deleteNotification); // User can delete own?

router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;

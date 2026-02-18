const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');
const { createLeaveRequestValidator, updateLeaveRequestValidator } = require('../validator/leaverequest.validator');

router.use(verifyJWT);

router.route('/')
  .get(verifyPermission('leaves:read'), leaveController.getLeaveRequests)
  .post(verifyPermission('leaves:create'), createLeaveRequestValidator, leaveController.requestLeave);

router.get('/:id', verifyPermission('leaves:read'), leaveController.getLeaveRequestById);

router.patch('/:id',
  verifyPermission('leaves:update'),
  updateLeaveRequestValidator,
  leaveController.updateLeaveStatus
);

module.exports = router;

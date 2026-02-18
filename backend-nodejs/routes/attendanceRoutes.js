const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const verifyJWT = require('../middleware/verifyJWT');
const verifyPermission = require('../middleware/verifyPermission');

router.use(verifyJWT);

router.post('/clock-in', verifyPermission('attendance:create'), attendanceController.clockIn);
router.post('/clock-out', verifyPermission('attendance:create'), attendanceController.clockOut);
router.get('/', verifyPermission('attendance:read'), attendanceController.getAttendance);
router.get('/:id', verifyPermission('attendance:read'), attendanceController.getAttendanceById);

module.exports = router;

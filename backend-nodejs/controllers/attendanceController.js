const Attendance = require('../models/Attendance');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

// @desc    Clock In
// @route   POST /api/attendance/clock-in
// @access  Private (User)
const clockIn = catchAsync(async (req, res) => {
  const userId = req.id;
  const now = new Date();

  // Normalize date to YYYY-MM-DD
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Check if already clocked in
  const existing = await Attendance.findOne({ user: userId, date: today });
  if (existing && existing.clockIn) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, "You have already clocked in for today.");
  }

  // Get User Schedule
  const user = await User.findById(userId).select('workSchedule');
  if (!user) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "User not found.");
  }

  // ... (keeping body same)
  let status = 'Present';
  let lateMinutes = 0;

  if (user.workSchedule) {
    // ... logic
    const [scheduleHours, scheduleMinutes] = user.workSchedule.startTime.split(':').map(Number);
    const scheduleTime = new Date(now);
    scheduleTime.setHours(scheduleHours, scheduleMinutes, 0, 0);
    const graceTime = new Date(scheduleTime.getTime() + (user.workSchedule.gracePeriodMinutes * 60000));

    if (now > graceTime) {
      status = 'Late';
      const diffMs = now - scheduleTime;
      lateMinutes = Math.floor(diffMs / 60000);
    }
  }

  let attendance;
  if (existing) {
    attendance = existing;
    attendance.clockIn = now;
    attendance.status = status;
    attendance.lateMinutes = lateMinutes;
    await attendance.save();
  } else {
    attendance = await Attendance.create({
      user: userId,
      date: today,
      clockIn: now,
      status,
      lateMinutes
    });
  }

  return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, status === 'Late' ? `Clocked in (Late by ${lateMinutes} mins)` : "Clocked in successfully", attendance);
});

// @desc    Clock Out
// ...
const clockOut = catchAsync(async (req, res) => {
  // ...
  const userId = req.id;
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({ user: userId, date: today });

  if (!attendance || !attendance.clockIn) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, "You have not clocked in yet today.");
  }

  attendance.clockOut = now;

  // Calculate Work Hours
  const diffMs = now - attendance.clockIn;
  const hours = diffMs / (1000 * 60 * 60);
  attendance.workHours = parseFloat(hours.toFixed(2));

  await attendance.save();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, "Clocked out successfully", attendance);
});

// @desc    Get Attendance Records
// ...
const getAttendance = catchAsync(async (req, res) => {
  // ...
  const { page = 1, limit = 31, user, startDate, endDate } = req.query;

  const query = {};
  if (!req.roles.includes('Admin') && !req.roles.includes('Editor')) {
    query.user = req.id;
  } else if (user) {
    query.user = user;
  }

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const count = await Attendance.countDocuments(query);
  const records = await Attendance.find(query)
    .populate('user', 'username email employeeCode')
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "Attendance records fetched", records, {
    total: count,
    total_pages: Math.ceil(count / limit),
    current_page: Number(page),
    per_page: Number(limit),
    has_more: page * limit < count
  });
});

// @desc    Get Single Attendance Record
// ...
const getAttendanceById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const attendance = await Attendance.findById(id).populate('user', 'username email employeeCode');

  if (!attendance) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "Attendance record not found");
  }

  if (!req.roles.includes('Admin') && !req.roles.includes('Editor') && attendance.user._id.toString() !== req.id) {
    return apiResponse(res, CODES.FORBIDDEN, MSG_CODES.ACCESS_DENIED, "Access denied");
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "Attendance record fetched", attendance);
});

module.exports = {
  clockIn,
  clockOut,
  getAttendance,
  getAttendanceById
};

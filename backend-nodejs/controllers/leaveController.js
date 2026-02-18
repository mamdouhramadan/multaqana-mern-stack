const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const catchAsync = require('../utils/catchAsync');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

// @desc    Request Leave
// @route   POST /api/leaves
// @access  Private (User)
const requestLeave = catchAsync(async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  const userId = req.id;

  if (!type || !startDate || !endDate) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, "Missing required fields");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate days (Roughly)
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

  // Check Balance (Optimistic check, strict check on approval)
  const user = await User.findById(userId);
  if (!user) return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "User not found");

  // Simple validation
  if (type === 'Annual' && user.leaveBalance.annual < diffDays) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, `Insufficient Annual Leave Balance. You have ${user.leaveBalance.annual} days.`);
  }

  const leaveRequest = await LeaveRequest.create({
    user: userId,
    type,
    startDate: start,
    endDate: end,
    daysCount: diffDays,
    reason
  });

  return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, "Leave request submitted successfully", leaveRequest);
});

// @desc    Get Leave Requests
// ...
const getLeaveRequests = catchAsync(async (req, res) => {
  // ...
  const { page = 1, limit = 10, status } = req.query;

  const query = {};
  if (!req.roles.includes('Admin') && !req.roles.includes('Editor')) {
    query.user = req.id;
  }
  if (status) query.status = status;

  const count = await LeaveRequest.countDocuments(query);
  const requests = await LeaveRequest.find(query)
    .populate('user', 'username employeeCode')
    .populate('approvedBy', 'username')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "Leave requests fetched", requests, {
    total: count,
    total_pages: Math.ceil(count / limit),
    current_page: Number(page),
    per_page: Number(limit),
    has_more: page * limit < count
  });
});


// @desc    Get Single Leave Request
// ...
const getLeaveRequestById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const request = await LeaveRequest.findById(id)
    .populate('user', 'username employeeCode')
    .populate('approvedBy', 'username')
    .lean();

  if (!request) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "Leave request not found");
  }

  // Check permission: Admin or Own
  if (!req.roles.includes('Admin') && !req.roles.includes('Editor') && request.user._id.toString() !== req.id) {
    return apiResponse(res, CODES.FORBIDDEN, MSG_CODES.ACCESS_DENIED, "Access denied");
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "Leave request fetched", request);
});

// @desc    Update Leave Status (Approve/Reject)
// ...
const updateLeaveStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Approved / Rejected

  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "Request not found");
  }

  if (leaveRequest.status !== 'Pending') {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, "Request is already processed");
  }

  if (status === 'Approved') {
    const user = await User.findById(leaveRequest.user);

    // Deduct Balance
    if (leaveRequest.type === 'Annual') {
      if (user.leaveBalance.annual < leaveRequest.daysCount) {
        return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, "User has insufficient balance now.");
      }
      user.leaveBalance.annual -= leaveRequest.daysCount;
    } else if (leaveRequest.type === 'Sick') {
      user.leaveBalance.sick -= leaveRequest.daysCount;
    }

    await user.save();

    leaveRequest.status = 'Approved';
    leaveRequest.approvedBy = req.id;
    await leaveRequest.save();

    return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, "Leave Approved", leaveRequest);
  }

  if (status === 'Rejected') {
    leaveRequest.status = 'Rejected';
    leaveRequest.approvedBy = req.id;
    await leaveRequest.save();
    return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, "Leave Rejected", leaveRequest);
  }

  return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, "Invalid Status");
});

module.exports = {
  requestLeave,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveStatus
};

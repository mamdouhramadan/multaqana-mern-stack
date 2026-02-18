/**
 * Employees = users with role "employee" (for public team listing e.g. home page).
 * @route   GET /api/employees
 * @access  Public
 */
const User = require('../models/User');
const Role = require('../models/Role');
const catchAsync = require('../utils/catchAsync');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

/** Fields safe to expose on public employee list (no password, tokens, etc.) */
const PUBLIC_FIELDS = 'username image jobTitle department position';

exports.getEmployees = catchAsync(async (req, res) => {
  const employeeRole = await Role.findOne({ slug: 'employee' }).select('_id').lean();
  if (!employeeRole) {
    return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Resources retrieved successfully', []);
  }

  const page = Math.max(1, (req.query.page && parseInt(req.query.page, 10)) || 1);
  const limit = Math.min(100, Math.max(1, (req.query.limit && parseInt(req.query.limit, 10)) || 20));
  const sort = (req.query.sort && String(req.query.sort).replace(/[^-a-zA-Z, ]/g, '')) || '-createdAt';

  const users = await User.find({
    role: employeeRole._id,
    active: { $ne: false }
  })
    .select(PUBLIC_FIELDS)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('department', 'title')
    .populate('position', 'title')
    .lean();

  const data = users.map((u) => ({
    id: u._id,
    image: u.image || '',
    name: u.username || '',
    jobTitle: u.jobTitle || null,
    department: u.department?.title || null
  }));

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Resources retrieved successfully', data);
});

const catchAsync = require('../utils/catchAsync');
const Department = require('../models/Department');
const { apiResponse } = require('../utils/apiResponse');
const { CODES, MSG_CODES, MESSAGES } = require('../config/responseConstants');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getAllDepartments = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { active: true };
  const total = await Department.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const departments = await Department.find(query)
    .sort({ title: 1 }) // Alphabetical order
    .skip(skip)
    .limit(limit)
    .lean();

  const pagination = {
    total,
    total_pages: totalPages,
    current_page: page,
    per_page: limit,
    has_more: page < totalPages
  };

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, departments, pagination);
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
const getDepartmentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const department = await Department.findById(id).lean();

  if (!department) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Department not found');
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, department);
});

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin/Editor)
const createDepartment = catchAsync(async (req, res) => {
  const { title, description, manager, active } = req.body;

  if (!title) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Title is required');
  }

  const duplicate = await Department.findOne({ title }).lean().exec();
  if (duplicate) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Department already exists');
  }

  const department = await Department.create({
    title,
    description,
    manager,
    active: active !== undefined ? (active === 'true' || active === true) : true
  });

  if (department) {
    return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, `Department ${title} created`, department);
  } else {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Invalid department data');
  }
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin/Editor)
const updateDepartment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, active } = req.body;

  const department = await Department.findById(id).exec();

  if (!department) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Department not found');
  }

  if (title && title !== department.title) {
    const duplicate = await Department.findOne({ title }).lean().exec();
    if (duplicate) {
      return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Department title already to use');
    }
    department.title = title;
  }

  if (description) department.description = description;

  if (typeof active !== 'undefined') {
    department.active = active;
  }

  const updatedDepartment = await department.save();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, `Department updated`, updatedDepartment);
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = catchAsync(async (req, res) => {
  const { id } = req.params;

  const department = await Department.findById(id).exec();

  if (!department) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Department not found');
  }

  // Check if any users are assigned to this department before deleting?
  // For now, we allow deletion as per requirement ease, but usually we should block or cascade.
  // Let's just delete.

  const result = await department.deleteOne();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, `Department ${result.title} deleted`);
});

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};

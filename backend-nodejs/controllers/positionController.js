const catchAsync = require('../utils/catchAsync');
const Position = require('../models/Position');
const { apiResponse } = require('../utils/apiResponse');
const { CODES, MSG_CODES, MESSAGES } = require('../config/responseConstants');

// @desc    Get all positions
// @route   GET /api/positions
// @access  Public
const getAllPositions = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { active: true };
  const total = await Position.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const positions = await Position.find(query)
    .sort({ title: 1 })
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

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, positions, pagination);
});

// @desc    Get single position
// @route   GET /api/positions/:id
// @access  Public
const getPositionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const position = await Position.findById(id).lean();

  if (!position) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Position not found');
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, position);
});

// @desc    Create new position
// @route   POST /api/positions
// @access  Private
const createPosition = catchAsync(async (req, res) => {
  const { title, description, department, active } = req.body;

  if (!title) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Title is required');
  }

  const duplicate = await Position.findOne({ title }).lean().exec();
  if (duplicate) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Position already exists');
  }

  const position = await Position.create({
    title,
    description,
    department,
    active: active !== undefined ? (active === 'true' || active === true) : true
  });

  if (position) {
    return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, `Position ${title} created`, position);
  } else {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Invalid position data');
  }
});

// @desc    Update position
// @route   PUT /api/positions/:id
// @access  Private
const updatePosition = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, active } = req.body;

  const position = await Position.findById(id).exec();

  if (!position) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Position not found');
  }

  if (title && title !== position.title) {
    const duplicate = await Position.findOne({ title }).lean().exec();
    if (duplicate) {
      return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Position title already in use');
    }
    position.title = title;
  }

  if (description) position.description = description;
  if (typeof active !== 'undefined') position.active = active;

  const updatedPosition = await position.save();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, `Position updated`, updatedPosition);
});

// @desc    Delete position
// @route   DELETE /api/positions/:id
// @access  Private
const deletePosition = catchAsync(async (req, res) => {
  const { id } = req.params;

  const position = await Position.findById(id).exec();

  if (!position) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Position not found');
  }

  const result = await position.deleteOne();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, `Position ${result.title} deleted`);
});

module.exports = {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
};

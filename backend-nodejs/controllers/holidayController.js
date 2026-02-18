const Holiday = require('../models/Holiday');
const catchAsync = require('../utils/catchAsync');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

// @desc    Get All Holidays
// @route   GET /api/holidays
// @access  Public
const getAllHolidays = catchAsync(async (req, res) => {
  const holidays = await Holiday.find().sort({ date: 1 });
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "Holidays fetched", holidays);
});

// @desc    Get Single Holiday
// @route   GET /api/holidays/:id
// @access  Public
const getHolidayById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const holiday = await Holiday.findById(id);

  if (!holiday) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "Holiday not found");
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "Holiday fetched", holiday);
});

// @desc    Create Holiday
// @route   POST /api/holidays
// @access  Private (Admin)
const createHoliday = catchAsync(async (req, res) => {
  const { name, date, isRecurring } = req.body;

  if (!name || !date) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, "Name and Date required");
  }

  const holiday = await Holiday.create({ name, date, isRecurring });

  return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, "Holiday created", holiday);
});

// @desc    Delete Holiday
// @route   DELETE /api/holidays/:id
// @access  Private (Admin)
const deleteHoliday = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Holiday.findByIdAndDelete(id);
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, "Holiday deleted");
});

module.exports = { getAllHolidays, getHolidayById, createHoliday, deleteHoliday };

const catchAsync = require('../utils/catchAsync');
const Magazine = require('../models/Magazine');
const { deleteFile } = require('../middleware/uploadMiddleware');
const { apiResponse } = require('../utils/apiResponse');
const { CODES, MSG_CODES, MESSAGES } = require('../config/responseConstants');

// @desc    Get all magazines
// @route   GET /api/magazines
// @access  Public
const getAllMagazines = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Magazine.countDocuments();
  const totalPages = Math.ceil(total / limit);

  const magazines = await Magazine.find()
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username image')
    .lean();

  const pagination = {
    total,
    total_pages: totalPages,
    current_page: page,
    per_page: limit,
    has_more: page < totalPages
  };

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, magazines, pagination);
});

// @desc    Get single magazine
// @route   GET /api/magazines/:id
// @access  Public
const getMagazineById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const magazine = await Magazine.findById(id)
    .populate('author', 'username image')
    .lean();

  if (!magazine) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Magazine not found');
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, magazine);
});

// @desc    Create new magazine
// @route   POST /api/magazines
// @access  Private (Admin/Editor)
const createMagazine = catchAsync(async (req, res) => {
  const { title, description, active, metadata, category } = req.body;

  if (!title || (!req.fileUrl && !req.files?.file)) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Title and Magazine PDF File are required');
  }

  const duplicate = await Magazine.findOne({ title }).lean().exec();
  if (duplicate) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Magazine with this title already exists');
  }

  const magazineObject = {
    title,
    description,
    author: req.id,
    thumbnail: req.thumbnailUrl || "",
    file: req.fileUrl,
    active: active !== undefined ? (active === 'true' || active === true) : true,
    metadata: metadata ? JSON.parse(metadata) : {},
    category
  };

  const magazine = await Magazine.create(magazineObject);

  if (magazine) {
    return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, 'New magazine created', magazine);
  } else {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Invalid magazine data');
  }
});

// @desc    Update magazine
// @route   PUT /api/magazines/:id
// @access  Private (Admin/Editor)
const updateMagazine = catchAsync(async (req, res) => {
  const { title, description, active, metadata, category } = req.body;
  const { id } = req.params;

  const magazine = await Magazine.findById(id).exec();

  if (!magazine) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Magazine not found');
  }

  if (title) magazine.title = title;
  if (description) magazine.description = description;
  if (typeof active !== 'undefined') magazine.active = active;
  if (metadata) magazine.metadata = JSON.parse(metadata);
  if (category) magazine.category = category;

  if (req.thumbnailUrl) {
    if (magazine.thumbnail) deleteFile(magazine.thumbnail);
    magazine.thumbnail = req.thumbnailUrl;
  }

  if (req.fileUrl) {
    if (magazine.file) deleteFile(magazine.file);
    magazine.file = req.fileUrl;
  }

  const updatedMagazine = await magazine.save();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, `Magazine '${updatedMagazine.title}' updated`, updatedMagazine);
});

// @desc    Delete magazine
// @route   DELETE /api/magazines/:id
// @access  Private (Admin)
const deleteMagazine = catchAsync(async (req, res) => {
  const { id } = req.params;

  const magazine = await Magazine.findById(id).exec();
  if (!magazine) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Magazine not found');
  }

  if (magazine.thumbnail) deleteFile(magazine.thumbnail);
  if (magazine.file) deleteFile(magazine.file);

  await magazine.deleteOne();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, `Magazine deleted`);
});

module.exports = {
  getAllMagazines,
  getMagazineById,
  createMagazine,
  updateMagazine,
  deleteMagazine
};

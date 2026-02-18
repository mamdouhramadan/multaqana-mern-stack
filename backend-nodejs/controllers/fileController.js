const File = require('../models/File');
const catchAsync = require('../utils/catchAsync');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');
const path = require('path');

// @desc    Get all files
// @route   GET /api/files
// @access  Public
const getAllFiles = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;

  const query = { active: true };
  if (category) query.category = category;

  const count = await File.countDocuments(query);
  const files = await File.find(query)
    .populate('category', 'title slug')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  res.status(CODES.SUCCESS).json(apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "Files fetched successfully", files, {
    total: count,
    total_pages: Math.ceil(count / limit),
    current_page: Number(page),
    per_page: Number(limit),
    has_more: page * limit < count
  }));
});

// @desc    Get single file
// @route   GET /api/files/:id
// @access  Public
const getFileById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = await File.findById(id).populate('category', 'title slug').lean();

  if (!file) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "File not found");
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "File fetched successfully", file);
});

// @desc    Upload File
// @route   POST /api/files
// @access  Private (Admin)
const uploadFile = catchAsync(async (req, res) => {
  const { title, description, category } = req.body;

  if (!req.file) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.UPLOAD_ERROR, "No file uploaded");
  }

  if (title) {
    const duplicate = await File.findOne({ title }).lean().exec();
    if (duplicate) {
      return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'File with this title already exists');
    }
  }

  const filePath = `/uploads/files/${req.file.filename}`;
  // Calculate Size (e.g. 2.4 MB)
  const sizeBytes = req.file.size;
  const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
  const sizeLabel = sizeMB > 1 ? `${sizeMB} MB` : `${(sizeBytes / 1024).toFixed(2)} KB`;

  const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();

  const file = await File.create({
    title: title || req.file.originalname,
    description,
    path: filePath,
    size: sizeLabel,
    extension: ext,
    category,
    createdBy: req.id
  });

  return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, "File uploaded successfully", file);
});

// @desc    Update file metadata (title, description, category)
// @route   PATCH /api/files/:id
// @access  Private (Admin)
const updateFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;

  const file = await File.findById(id).exec();
  if (!file) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "File not found");
  }

  if (title !== undefined) file.title = title;
  if (description !== undefined) file.description = description;
  if (category !== undefined) file.category = category;

  await file.save();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, "File updated", file);
});

// @desc    Delete File
// @route   DELETE /api/files/:id
// @access  Private (Admin)
const deleteFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  await File.findByIdAndDelete(id);
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, "File deleted successfully");
});

module.exports = {
  getAllFiles,
  getFileById,
  uploadFile,
  updateFile,
  deleteFile
};

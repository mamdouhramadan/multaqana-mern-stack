const catchAsync = require('../utils/catchAsync');
const Video = require('../models/Video');
const { deleteFile } = require('../middleware/uploadMiddleware'); // Helper to clean up files
const { apiResponse } = require('../utils/apiResponse');
const { CODES, MSG_CODES, MESSAGES } = require('../config/responseConstants');

// @desc    Get all active videos
// @route   GET /api/videos
// @access  Public
const getAllVideos = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Video.countDocuments({ active: true });
  const totalPages = Math.ceil(total / limit);

  const videos = await Video.find({ active: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('category', 'title slug')
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username')
    .lean();

  const pagination = {
    total,
    total_pages: totalPages,
    current_page: page,
    per_page: limit,
    has_more: page < totalPages
  };

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, videos, pagination);
});

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id)
    .populate('category', 'title slug')
    .populate('createdBy', 'username')
    .lean();

  if (!video) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "Video not found");
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, video);
});

// @desc    Create new video
// @route   POST /api/videos
// @access  Private
const createVideo = catchAsync(async (req, res) => {
  const { title, description, videoType, videoUrl, category, active } = req.body;

  if (!title || !videoType) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Title and Video Type are required');
  }

  if (videoType === 'url' && !videoUrl) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Video URL is required for URL type');
  }

  const duplicate = await Video.findOne({ title }).lean().exec();
  if (duplicate) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Video with this title already exists');
  }

  const videoObject = {
    title,
    description,
    videoType,
    videoUrl: videoType === 'url' ? videoUrl : "",
    videoFile: videoType === 'file' ? (req.videoUrl || "") : "",
    category,
    createdBy: req.id,
    active: active !== undefined ? (active === 'true' || active === true) : true
  };

  const video = await Video.create(videoObject);

  if (video) {
    return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, 'Video created', video);
  } else {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Invalid video data');
  }
});

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private
const updateVideo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, videoType, videoUrl, category, active } = req.body;

  const video = await Video.findById(id).exec();
  if (!video) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Video not found');
  }

  if (title !== undefined) video.title = title;
  if (description !== undefined) video.description = description;
  if (videoType !== undefined) video.videoType = videoType;
  if (videoUrl !== undefined) video.videoUrl = videoType === 'url' ? videoUrl : '';
  if (category !== undefined) video.category = category;
  if (active !== undefined) video.active = active === true || active === 'true';
  if (req.videoUrl) video.videoFile = req.videoUrl;
  video.updatedBy = req.id;

  await video.save();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, 'Video updated', video);
});

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
const deleteVideo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).exec();

  if (!video) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Video not found');
  }

  await video.deleteOne();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, 'Video deleted');
});

module.exports = {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};

const catchAsync = require('../utils/catchAsync');
const PhotoAlbum = require('../models/PhotoAlbum');
const { apiResponse } = require('../utils/apiResponse');
const { CODES, MSG_CODES, MESSAGES } = require('../config/responseConstants');

// @desc    Get all albums
// @route   GET /api/albums
// @access  Public
const getAllAlbums = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await PhotoAlbum.countDocuments({ active: true });
  const totalPages = Math.ceil(total / limit);

  const albums = await PhotoAlbum.find({ active: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('category', 'title slug')
    .populate('createdBy', 'username')
    .lean();

  const pagination = {
    total,
    total_pages: totalPages,
    current_page: page,
    per_page: limit,
    has_more: page < totalPages
  };

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, albums, pagination);
});

// @desc    Get single album
// @route   GET /api/albums/:id
// @access  Public
const getAlbumById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const album = await PhotoAlbum.findById(id)
    .populate('category', 'title slug')
    .populate('createdBy', 'username')
    .lean();

  if (!album) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "Album not found");
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, album);
});

// @desc    Create new album
// @route   POST /api/albums
// @access  Private
const createAlbum = catchAsync(async (req, res) => {
  const { title, description, category, active } = req.body;

  if (!title) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Title is required');
  }

  const duplicate = await PhotoAlbum.findOne({ title }).lean().exec();
  if (duplicate) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Album with this title already exists');
  }

  const images = req.imageUrls || [];
  const thumbnail = images.length > 0 ? images[0] : "";

  const albumObject = {
    title,
    description,
    thumbnail,
    images,
    category,
    createdBy: req.id,
    active: active !== undefined ? (active === 'true' || active === true) : true
  };

  const album = await PhotoAlbum.create(albumObject);

  if (album) {
    return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, 'Album created', album);
  } else {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Invalid album data');
  }
});

// @desc    Update album
// @route   PUT /api/albums/:id
// @access  Private
const updateAlbum = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, active } = req.body;

  const album = await PhotoAlbum.findById(id).exec();
  if (!album) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Album not found');
  }

  if (title !== undefined) album.title = title;
  if (description !== undefined) album.description = description;
  if (category !== undefined) album.category = category;
  if (active !== undefined) album.active = active === true || active === 'true';
  if (req.imageUrls && req.imageUrls.length > 0) {
    album.images = req.imageUrls;
    album.thumbnail = req.imageUrls[0];
  }
  album.updatedBy = req.id;

  await album.save();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, 'Album updated', album);
});

// @desc    Delete album
// @route   DELETE /api/albums/:id
// @access  Private
const deleteAlbum = catchAsync(async (req, res) => {
  const { id } = req.params;
  const album = await PhotoAlbum.findById(id).exec();

  if (!album) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Album not found');
  }

  await album.deleteOne();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, 'Album deleted');
});

module.exports = {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
};

const catchAsync = require('../utils/catchAsync');
const Category = require('../models/Category');
const { apiResponse } = require('../utils/apiResponse');
const { CODES, MSG_CODES, MESSAGES } = require('../config/responseConstants');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
// Query params: ?module=news (to filter)
const getAllCategories = catchAsync(async (req, res) => {
  const { module } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = { active: true };
  if (module) {
    query.module = module;
  }

  const total = await Category.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const categories = await Category.find(query)
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

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, categories, pagination);
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id).lean();

  if (!category) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Category not found');
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, category);
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin/Editor)
const createCategory = catchAsync(async (req, res) => {
  const { title, description, module, active } = req.body;

  // Validation
  if (!title || !module) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Title and Module are required');
  }

  const duplicate = await Category.findOne({ title }).lean().exec();
  if (duplicate) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Category title already exists');
  }

  const category = await Category.create({
    title,
    description,
    module,
    active: active !== undefined ? (active === 'true' || active === true) : true
  });

  if (category) {
    return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, `Category ${title} created`, category);
  } else {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Invalid category data');
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Editor)
const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, module, active } = req.body;

  const category = await Category.findById(id).exec();

  if (!category) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Category not found');
  }

  // Update fields
  if (title && title !== category.title) {
    const duplicate = await Category.findOne({ title }).lean().exec();
    if (duplicate) {
      return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Category title already in use');
    }
    category.title = title;
  }

  if (description) category.description = description;
  if (module) category.module = module;
  if (typeof active !== 'undefined') category.active = active;

  const updatedCategory = await category.save();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, `Category updated`, updatedCategory);
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id).exec();

  if (!category) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Category not found');
  }

  await category.deleteOne();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, `Category ${category.title} deleted`);
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

const catchAsync = require('../utils/catchAsync');
const FAQ = require('../models/FAQ');
const { apiResponse } = require('../utils/apiResponse');
const { CODES, MSG_CODES, MESSAGES } = require('../config/responseConstants');

// @desc    Get all active FAQs
// @route   GET /api/faqs
// @access  Public
const getAllFAQs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await FAQ.countDocuments({ active: true });
  const totalPages = Math.ceil(total / limit);

  const faqs = await FAQ.find({ active: true })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('category', 'title slug')
    .lean();

  const pagination = {
    total,
    total_pages: totalPages,
    current_page: page,
    per_page: limit,
    has_more: page < totalPages
  };

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, faqs, pagination);
});

// @desc    Get single FAQ
// @route   GET /api/faqs/:id
// @access  Public
const getFAQById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const faq = await FAQ.findById(id).populate('category', 'title slug').lean();

  if (!faq) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'FAQ not found');
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, MESSAGES.FETCH, faq);
});

// @desc    Create new FAQ
// @route   POST /api/faqs
// @access  Private
const createFAQ = catchAsync(async (req, res) => {
  const { title, description, category, tags, active } = req.body;

  if (!title || !description) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Question (title) and Answer (description) are required');
  }

  const duplicate = await FAQ.findOne({ title }).lean().exec();
  if (duplicate) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'FAQ with this question already exists');
  }

  const faqObject = {
    title,
    description,
    category,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [],
    createdBy: req.id,
    active: active !== undefined ? (active === 'true' || active === true) : true
  };

  const faq = await FAQ.create(faqObject);

  if (faq) {
    return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, 'FAQ created', faq);
  } else {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Invalid FAQ data');
  }
});

// @desc    Update FAQ
// @route   PUT /api/faqs/:id
// @access  Private
const updateFAQ = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, tags, active } = req.body;

  const faq = await FAQ.findById(id).exec();
  if (!faq) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'FAQ not found');
  }

  if (title !== undefined) faq.title = title;
  if (description !== undefined) faq.description = description;
  if (category !== undefined) faq.category = category;
  if (tags !== undefined) faq.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []);
  if (active !== undefined) faq.active = active === true || active === 'true';
  faq.updatedBy = req.id;

  await faq.save();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, 'FAQ updated', faq);
});

// @desc    Delete FAQ
// @route   DELETE /api/faqs/:id
// @access  Private
const deleteFAQ = catchAsync(async (req, res) => {
  const { id } = req.params;
  const faq = await FAQ.findById(id).exec();

  if (!faq) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'FAQ not found');
  }

  await faq.deleteOne();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, 'FAQ deleted');
});

module.exports = {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};

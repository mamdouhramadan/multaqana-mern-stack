const catchAsync = require('../utils/catchAsync');
const News = require('../models/News');
const path = require('path');
const fsp = require('fs').promises;
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

// Helper to delete file (async; ignores missing file)
const deleteFile = async (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '..', 'public', filePath);
  try {
    await fsp.unlink(fullPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
};

// @desc    Get all news
// @route   GET /api/news
// @access  Public (Anyone can see news)
const getAllNews = catchAsync(async (req, res) => {
  // 1. Fetch all news from MongoDB
  // .populate('author', 'username image'): Replace the author ID with the actual User object (only username and image fields)
  const news = await News.find().sort({ publishedAt: -1 }).populate('author', 'username image').lean();

  // 2. Check if any news exist
  if (!news?.length) {
    return res.status(200).json([]); // Return empty array if no news found
  }

  // 3. Send the list of news
  res.json(news);
});

// @desc    Get single news
// @route   GET /api/news/:id
// @access  Public
const getNewsById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const newsItem = await News.findById(id).populate('author', 'username image').lean();

  if (!newsItem) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'News not found');
  }

  res.json(newsItem);
});

// @desc    Create new news item
// @route   POST /api/news
// @access  Private (Only Admin/Editor can create)
const createNews = catchAsync(async (req, res) => {
  const { title, content, active, metadata } = req.body;

  // 1. Validation
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and Content are required' });
  }

  // 2. Check for duplicates
  const duplicate = await News.findOne({ title }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: 'News article with this title already exists' });
  }

  // 3. Create the object to save
  const thumbnailUrl = req.file ? req.file.publicUrl : (req.body.thumbnail || "");
  const newsObject = {
    title,
    content,
    author: req.id,
    thumbnail: thumbnailUrl,
    active: active !== undefined ? (active === 'true' || active === true) : true,
    metadata: metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : {}
  };

  // 4. Save to Database
  const news = await News.create(newsObject);

  // 5. Send response
  if (news) {
    res.status(201).json({ message: 'New news created', news });
  } else {
    res.status(400).json({ message: 'Invalid news data received' });
  }
});

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private (Only Admin/Editor can update)
const updateNews = catchAsync(async (req, res) => {
  const { title, content, active, metadata } = req.body;
  const { id } = req.params;

  // 1. Find the news item
  const news = await News.findById(id).exec();

  if (!news) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'News not found');
  }

  // 2. Update fields if permission allowed (Add check if owner or admin? For now sticking to role check)
  if (title) news.title = title; // Pre-save hook will update slug automatically
  if (content) news.content = content;
  if (typeof active !== 'undefined') news.active = active;
  if (metadata) news.metadata = JSON.parse(metadata);

  // 3. Handle Image Update (file upload or URL in body)
  if (req.file) {
    if (news.thumbnail) await deleteFile(news.thumbnail);
    news.thumbnail = req.file.publicUrl;
  } else if (req.body.thumbnail) {
    news.thumbnail = req.body.thumbnail;
  }

  // 4. Save changes
  const updatedNews = await news.save();

  res.json({ message: `News '${updatedNews.title}' updated`, news: updatedNews });
});

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private (Admin/Editor)
const deleteNews = catchAsync(async (req, res) => {
  const { id } = req.params;

  const news = await News.findById(id).exec();

  if (!news) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'News not found');
  }

  // Delete image file associated with news
  if (news.thumbnail) {
    await deleteFile(news.thumbnail);
  }

  const result = await news.deleteOne();

  const reply = `News '${result.title}' with ID ${result._id} deleted`;

  res.json({ message: reply });
});

module.exports = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
};

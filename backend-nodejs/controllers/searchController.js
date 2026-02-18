const catchAsync = require('../utils/catchAsync');
const FAQ = require('../models/FAQ');
const News = require('../models/News');
const Video = require('../models/Video');
const Magazine = require('../models/Magazine');
const File = require('../models/File');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

const TYPES = ['faqs', 'news', 'videos', 'magazines', 'files'];

function makeRegex(q) {
  if (!q || typeof q !== 'string' || !q.trim()) return null;
  return new RegExp(q.trim().replace(/\s+/g, ' ').split(' ').map(w => `(?=.*${escapeRegex(w)})`).join(''), 'i');
}
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function snippet(text, maxLen = 120) {
  if (!text || typeof text !== 'string') return '';
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= maxLen ? t : t.slice(0, maxLen) + '…';
}

// @desc    Unified search across FAQs, News, Videos, Magazines, Files
// @route   GET /api/search?q=...&type=faqs|news|videos|magazines|files
// @access  Public
const search = catchAsync(async (req, res) => {
  const q = req.query.q || req.query.search || '';
  const type = (req.query.type || '').toLowerCase();

  const regex = makeRegex(q);
  const typesToSearch = type && TYPES.includes(type) ? [type] : TYPES;
  const results = [];

  if (!regex) {
    return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Search results', []);
  }

  if (typesToSearch.includes('faqs')) {
    const faqs = await FAQ.find({ active: true, $or: [{ title: regex }, { description: regex }] })
      .limit(20)
      .lean();
    faqs.forEach((doc) => {
      results.push({
        id: doc._id.toString(),
        title: doc.title,
        snippet: snippet(doc.description),
        url: `/faqs`,
        type: 'faq',
      });
    });
  }

  if (typesToSearch.includes('news')) {
    const news = await News.find({ active: true, $or: [{ title: regex }, { content: regex }] })
      .limit(20)
      .lean();
    news.forEach((doc) => {
      results.push({
        id: doc._id.toString(),
        title: doc.title,
        snippet: snippet(doc.content),
        url: `/news`,
        type: 'news',
      });
    });
  }

  if (typesToSearch.includes('videos')) {
    const videos = await Video.find({ active: true, $or: [{ title: regex }, { description: regex }] })
      .limit(20)
      .lean();
    videos.forEach((doc) => {
      results.push({
        id: doc._id.toString(),
        title: doc.title,
        snippet: snippet(doc.description),
        url: `/videos`,
        type: 'video',
      });
    });
  }

  if (typesToSearch.includes('magazines')) {
    const magazines = await Magazine.find({ active: true, $or: [{ title: regex }, { description: regex }] })
      .limit(20)
      .lean();
    magazines.forEach((doc) => {
      results.push({
        id: doc._id.toString(),
        title: doc.title,
        snippet: snippet(doc.description),
        url: `/magazines`,
        type: 'magazine',
      });
    });
  }

  if (typesToSearch.includes('files')) {
    const files = await File.find({ active: true, $or: [{ title: regex }, { description: regex }] })
      .limit(20)
      .lean();
    files.forEach((doc) => {
      results.push({
        id: doc._id.toString(),
        title: doc.title,
        snippet: snippet(doc.description),
        url: `/files`,
        type: 'file',
      });
    });
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Search results', results);
});

module.exports = { search };

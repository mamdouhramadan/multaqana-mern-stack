const Settings = require('../models/Settings');
const catchAsync = require('../utils/catchAsync');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');
const ROLES_LIST = require('../config/roles_list');

/**
 * @desc    Get all settings
 * @route   GET /api/settings
 * @access  Public (for public settings), Private/Admin (for all)
 */
const getSettings = catchAsync(async (req, res) => {
  let query = { isPublic: true };

  if (req.user && req.roles && (req.roles.includes(ROLES_LIST.Admin) || req.roles.includes(ROLES_LIST.Editor))) {
    query = {};
  }

  const settings = await Settings.find(query).sort({ category: 1, key: 1 });

  // Convert array to object for easier frontend consumption { key: value }
  // OR return list depending on preference. Let's return list for CMS, map for frontend.
  // For this API, let's keep it standard REST list.

  res.json({
    success: true,
    count: settings.length,
    data: settings
  });
});

/**
 * @desc    Get public settings (Unauthenticated)
 * @route   GET /api/settings/public
 * @access  Public
 */
const getPublicSettings = catchAsync(async (req, res) => {
  const settings = await Settings.find({ isPublic: true }).select('key value category description');
  res.json({ success: true, data: settings });
});


/**
 * @desc    Create or Update a setting
 * @route   POST /api/settings
 * @access  Private (Admin)
 */
const upsertSetting = catchAsync(async (req, res) => {
  const { key, value, category, isPublic, description } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ message: 'Key and Value are required' });
  }

  // Upsert: Update if exists, Insert if new
  const setting = await Settings.findOneAndUpdate(
    { key },
    { value, category, isPublic, description },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, message: 'Setting saved', data: setting });
});

/**
 * @desc    Delete a setting
 * @route   DELETE /api/settings/:key
 * @access  Private (Admin)
 */
const deleteSetting = catchAsync(async (req, res) => {
  const { key } = req.params;
  const setting = await Settings.findOneAndDelete({ key });

  if (!setting) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Setting not found');
  }

  res.json({ success: true, message: `Setting ${key} deleted` });
});

const ALLOWED_UPLOAD_KEYS = ['site_logo', 'favicon'];

/**
 * @desc    Upload logo or favicon and upsert setting
 * @route   POST /api/settings/upload
 * @access  Private (Admin)
 * Body (multipart): key = site_logo | favicon, file = image
 */
const uploadSettingAsset = catchAsync(async (req, res) => {
  const key = req.body?.key;
  if (!key || !ALLOWED_UPLOAD_KEYS.includes(key)) {
    return apiResponse(res, 400, 'VALIDATION_ERROR', 'Invalid or missing key. Allowed: site_logo, favicon');
  }
  if (!req.file?.publicUrl) {
    return apiResponse(res, 400, 'VALIDATION_ERROR', 'No file uploaded or upload failed');
  }

  const setting = await Settings.findOneAndUpdate(
    { key },
    { value: req.file.publicUrl, category: 'Appearance', isPublic: true },
    { new: true, upsert: true, runValidators: true }
  );

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, 'Setting updated', setting);
});

module.exports = {
  getSettings,
  getPublicSettings,
  upsertSetting,
  deleteSetting,
  uploadSettingAsset
};

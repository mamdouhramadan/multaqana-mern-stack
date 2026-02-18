const Application = require('../models/Application');
const catchAsync = require('../utils/catchAsync');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Public
const getAllApplications = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, category, status } = req.query;

  const query = { active: true };
  if (category) query.category = category;
  if (status) query.status = status;

  const count = await Application.countDocuments(query);
  const applications = await Application.find(query)
    .populate('category', 'title slug')
    .populate('department', 'name')
    .sort({ title: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "Applications fetched successfully", applications, {
    total: count,
    total_pages: Math.ceil(count / limit),
    current_page: Number(page),
    per_page: Number(limit),
    has_more: page * limit < count
  });
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Public
const getApplicationById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const application = await Application.findById(id)
    .populate('category', 'title slug')
    .populate('department', 'name')
    .lean();

  if (!application) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "Application not found");
  }

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, "Application fetched successfully", application);
});

// @desc    Create application
// @route   POST /api/applications
// @access  Private (Admin)
const createApplication = catchAsync(async (req, res) => {
  // ... (keeping body same until response)
  const {
    title, description, url, category, status, isInternal,
    department, technicalOwner, supportEmail, mobileApps /* JSON string */
  } = req.body;

  // Handle Logo Upload
  let logoPath = "";
  if (req.files && req.files.logo) {
    logoPath = `/uploads/applications/${req.files.logo[0].filename}`;
  }

  const duplicate = await Application.findOne({ title }).lean().exec();
  if (duplicate) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Application with this title already exists');
  }

  // Parse Mobile Apps
  let parsedMobileApps = [];
  if (mobileApps) {
    try {
      parsedMobileApps = JSON.parse(mobileApps);
    } catch (e) {
      console.error("Error parsing mobile apps", e);
    }
  }

  const application = await Application.create({
    title,
    description,
    url,
    category,
    status,
    isInternal: isInternal === 'true' || isInternal === true,
    department,
    technicalOwner,
    supportEmail,
    logo: logoPath,
    mobileApps: parsedMobileApps,
    createdBy: req.id
  });

  return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, "Application created successfully", application);
});

// @desc    Update application
// ...
const updateApplication = catchAsync(async (req, res) => {
  // ...
  const { id } = req.params;
  const {
    title, description, url, category, status, isInternal,
    department, technicalOwner, supportEmail, mobileApps
  } = req.body;

  const application = await Application.findById(id);
  if (!application) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, "Application not found");
  }

  // ... (updates)
  if (req.files && req.files.logo) application.logo = `/uploads/applications/${req.files.logo[0].filename}`;
  if (title) application.title = title;
  if (description) application.description = description;
  if (url) application.url = url;
  if (category) application.category = category;
  if (status) application.status = status;
  if (isInternal !== undefined) application.isInternal = isInternal === 'true' || isInternal === true;
  if (department) application.department = department;
  if (technicalOwner) application.technicalOwner = technicalOwner;
  if (supportEmail) application.supportEmail = supportEmail;

  if (mobileApps) {
    try {
      application.mobileApps = JSON.parse(mobileApps);
    } catch (e) {
      console.error("Error parsing mobile apps update", e);
    }
  }

  application.updatedBy = req.id;
  await application.save();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, "Application updated successfully", application);
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Admin)
const deleteApplication = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Application.findByIdAndDelete(id);
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, "Application deleted successfully");
});

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication
};

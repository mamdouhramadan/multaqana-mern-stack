const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body,
    'username',
    'email',
    'phoneNumber',
    'address',        // Personal
    'dateOfBirth',    // Personal
    'gender',         // Personal
    'nationality',    // Personal
    'emergencyContact', // Personal
    'personalEmail',  // Personal
    'language'        // Personal
  );
  if (req.file) filteredBody.image = `/img/users/${req.file.filename}`; // Fix: photo -> image, and add path prefix

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.id, filteredBody, {
    new: true,
    runValidators: true
  });

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, 'Profile updated successfully', updatedUser);
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.id, { active: false });

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, 'Account deactivated successfully', []);
});

exports.createUser = (req, res) => {
  return apiResponse(res, CODES.SERVER_ERROR, MSG_CODES.SERVER_ERROR, 'This route is not defined! Please use /signup instead', []);
};

exports.getUser = factory.getOne(User, [
  { path: 'role', select: 'name slug' },
  { path: 'department', select: 'title' },
  { path: 'position', select: 'title' }
]);
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query).filter().sort().limitFields().paginate();
  const doc = await features.query
    .populate('role', 'name slug')
    .populate('department', 'title')
    .populate('position', 'title');
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Resources retrieved successfully', doc);
});

// Sanitize empty string to null so Mongoose can unset refs
exports.sanitizeUserUpdate = (req, res, next) => {
  if (req.body.department === '') req.body.department = null;
  if (req.body.position === '') req.body.position = null;
  next();
};

// Do NOT update password with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

/**
 * Reusable CRUD handlers that work with any Mongoose Model.
 * Each factory uses catchAsync and AppError so errors are handled by the central error middleware.
 * Responses use the standard apiResponse format (success, code, message_code, message, data).
 */
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

/** deleteOne(Model): DELETE /:id — delete document by id; 404 if not found */
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, 'Resource deleted successfully', []);
  });

/** updateOne(Model): PATCH/PUT /:id — update by id; 404 if not found */
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, 'Resource updated successfully', doc);
  });

/** createOne(Model): POST / — create new document */
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, 'Resource created successfully', doc);
  });

/** getOne(Model, popOptions?): GET /:id — fetch one by id, optional populate; 404 if not found */
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Resource retrieved successfully', doc);
  });

/** getAll(Model): GET / — list with query string filter, sort, limit, paginate (via APIFeatures) */
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Resources retrieved successfully', doc);
  });

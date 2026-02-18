const catchAsync = require('../utils/catchAsync');
const Event = require('../models/Event');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getAllEvents = catchAsync(async (req, res) => {
  const events = await Event.find({ active: true })
    .sort({ start: 1 })
    .lean();

  const formatted = events.map((e) => ({
    id: e._id.toString(),
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: e.allDay,
    resource: e.resource || '',
    cover_image: e.cover_image || '',
    details: e.details || '',
  }));

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Events fetched', formatted);
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id).lean();

  if (!event) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Event not found');
  }

  const formatted = {
    id: event._id.toString(),
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    resource: event.resource || '',
    cover_image: event.cover_image || '',
    details: event.details || '',
  };

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Event fetched', formatted);
});

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = catchAsync(async (req, res) => {
  const { title, start, end, allDay, resource, cover_image, details } = req.body;

  if (!title || !start || !end) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Title, start and end are required');
  }

  const eventObject = {
    title,
    start: new Date(start),
    end: new Date(end),
    allDay: allDay === true || allDay === 'true',
    resource: resource || '',
    cover_image: cover_image || '',
    details: details || '',
  };

  const event = await Event.create(eventObject);
  const formatted = {
    id: event._id.toString(),
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    resource: event.resource || '',
    cover_image: event.cover_image || '',
    details: event.details || '',
  };

  return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, 'Event created', formatted);
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, start, end, allDay, resource, cover_image, details } = req.body;

  const event = await Event.findById(id).exec();
  if (!event) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Event not found');
  }

  if (title !== undefined) event.title = title;
  if (start !== undefined) event.start = new Date(start);
  if (end !== undefined) event.end = new Date(end);
  if (allDay !== undefined) event.allDay = allDay === true || allDay === 'true';
  if (resource !== undefined) event.resource = resource;
  if (cover_image !== undefined) event.cover_image = cover_image;
  if (details !== undefined) event.details = details;

  await event.save();
  const formatted = {
    id: event._id.toString(),
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    resource: event.resource || '',
    cover_image: event.cover_image || '',
    details: event.details || '',
  };

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, 'Event updated', formatted);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id).exec();

  if (!event) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Event not found');
  }

  await event.deleteOne();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, 'Event deleted');
});

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

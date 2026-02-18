const catchAsync = require('../utils/catchAsync');
const Role = require('../models/Role');
const User = require('../models/User');
const { apiResponse, CODES, MSG_CODES } = require('../utils/apiResponse');
const { PERMISSIONS_GROUPED } = require('../config/permissions');

/** GET /api/roles - List all roles */
const getAllRoles = catchAsync(async (req, res) => {
  const roles = await Role.find().sort({ name: 1 }).lean();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Roles retrieved', roles);
});

/** GET /api/roles/permissions - List all permission strings (grouped for UI) */
const getPermissions = catchAsync(async (req, res) => {
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Permissions list', PERMISSIONS_GROUPED);
});

/** GET /api/roles/default - Get the default role for new registrations */
const getDefaultRole = catchAsync(async (req, res) => {
  const role = await Role.findOne({ isDefault: true }).lean();
  if (!role) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'No default role set');
  }
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Default role', role);
});

/** GET /api/roles/:id - Get one role */
const getRoleById = catchAsync(async (req, res) => {
  const role = await Role.findById(req.params.id).lean();
  if (!role) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Role not found');
  }
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.FETCH_SUCCESS, 'Role retrieved', role);
});

/** POST /api/roles - Create role; if isDefault, clear others */
const createRole = catchAsync(async (req, res) => {
  const { name, slug, permissions, isDefault } = req.body;

  const existing = await Role.findOne({ $or: [{ slug: (slug || name).toLowerCase().replace(/\s+/g, '-') }, { name }] }).lean();
  if (existing) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.DUPLICATE, 'Role with this name or slug already exists');
  }

  const roleSlug = (slug || name).toLowerCase().trim().replace(/\s+/g, '-');
  if (isDefault) {
    await Role.updateMany({}, { $set: { isDefault: false } });
  }

  const role = await Role.create({
    name: name.trim(),
    slug: roleSlug,
    permissions: Array.isArray(permissions) ? permissions : [],
    isDefault: !!isDefault
  });

  return apiResponse(res, CODES.CREATED, MSG_CODES.CREATE_SUCCESS, 'Role created', role);
});

/** PATCH /api/roles/:id - Update role; if isDefault true, clear others */
const updateRole = catchAsync(async (req, res) => {
  const { name, slug, permissions, isDefault } = req.body;
  const role = await Role.findById(req.params.id);

  if (!role) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Role not found');
  }

  if (name !== undefined) role.name = name.trim();
  if (slug !== undefined) role.slug = slug.toLowerCase().trim().replace(/\s+/g, '-');
  if (Array.isArray(permissions)) role.permissions = permissions;
  if (typeof isDefault === 'boolean') {
    if (isDefault) {
      await Role.updateMany({ _id: { $ne: role._id } }, { $set: { isDefault: false } });
    }
    role.isDefault = isDefault;
  }

  await role.save();

  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, 'Role updated', role);
});

/** PATCH /api/roles/:id/set-default - Set this role as default (convenience) */
const setDefaultRole = catchAsync(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Role not found');
  }
  await Role.updateMany({}, { $set: { isDefault: false } });
  role.isDefault = true;
  await role.save();
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.UPDATE_SUCCESS, 'Default role updated', role);
});

/** DELETE /api/roles/:id - Delete role only if no users have it */
const deleteRole = catchAsync(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return apiResponse(res, CODES.NOT_FOUND, MSG_CODES.NOT_FOUND, 'Role not found');
  }

  const userCount = await User.countDocuments({ role: role._id });
  if (userCount > 0) {
    return apiResponse(res, CODES.CONFLICT, MSG_CODES.CONFLICT, `Cannot delete role: ${userCount} user(s) have this role`);
  }

  if (role.isDefault) {
    return apiResponse(res, CODES.BAD_REQUEST, MSG_CODES.VALIDATION_ERROR, 'Cannot delete the default role. Set another role as default first.');
  }

  await Role.findByIdAndDelete(req.params.id);
  return apiResponse(res, CODES.SUCCESS, MSG_CODES.DELETE_SUCCESS, 'Role deleted', []);
});

module.exports = {
  getAllRoles,
  getPermissions,
  getDefaultRole,
  getRoleById,
  createRole,
  updateRole,
  setDefaultRole,
  deleteRole
};

/**
 * Single source of truth for permission strings (resource:action).
 * Used by Role model and verifyPermission middleware; can be exposed via GET /api/roles/permissions.
 */
const RESOURCES = [
  'applications', 'attendance', 'categories', 'departments', 'events', 'faqs',
  'files', 'holidays', 'leaves', 'magazines', 'news', 'notifications',
  'photos', 'positions', 'settings', 'users', 'videos', 'roles'
];

const ACTIONS = ['create', 'read', 'update', 'delete'];

const PERMISSIONS_FLAT = [];
for (const resource of RESOURCES) {
  for (const action of ACTIONS) {
    PERMISSIONS_FLAT.push(`${resource}:${action}`);
  }
}

/** Grouped by resource for UI (e.g. checkboxes per section) */
const PERMISSIONS_GROUPED = RESOURCES.map(resource => ({
  resource,
  permissions: ACTIONS.map(action => `${resource}:${action}`)
}));

module.exports = {
  PERMISSIONS_FLAT,
  PERMISSIONS_GROUPED,
  RESOURCES,
  ACTIONS
};

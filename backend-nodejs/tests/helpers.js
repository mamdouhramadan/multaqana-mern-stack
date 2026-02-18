const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require('../models/Role');
const { PERMISSIONS_FLAT } = require('../config/permissions');

const generateTestToken = (user) => {
  const userData = user.toObject ? user.toObject() : user;
  const roles = userData.roles ? Object.values(userData.roles).filter(Boolean) : [5150, 1984, 2001];
  return jwt.sign(
    {
      "UserInfo": {
        "username": user.username,
        "roles": roles,
        "id": user._id.toString()
      }
    },
    process.env.ACCESS_TOKEN_SECRET || 'test_secret',
    { expiresIn: '15m' }
  );
};

// Ensure roles exist and return role doc by slug (for permission-based tests)
async function getOrCreateRole(slug, permissions) {
  let role = await Role.findOne({ slug });
  if (!role) {
    role = await Role.create({ name: slug, slug, permissions, isDefault: slug === 'user' });
  }
  return role;
}

const createTestUser = async (roleName = 'User') => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const roles = { User: 2001 };
  if (roleName === 'Admin') roles.Admin = 5150;
  if (roleName === 'Editor') roles.Editor = 1984;

  let roleDoc = null;
  if (roleName === 'Admin') {
    roleDoc = await getOrCreateRole('admin', PERMISSIONS_FLAT);
  } else if (roleName === 'Editor') {
    roleDoc = await getOrCreateRole('editor', PERMISSIONS_FLAT.filter(p => {
      const [res, action] = p.split(':');
      const contentResources = ['applications', 'events', 'faqs', 'files', 'magazines', 'news', 'photos', 'videos'];
      if (res === 'categories') return action !== 'delete'; // categories: Editor no delete (Admin only in structure test)
      return contentResources.includes(res) || p === 'users:read' || p === 'leaves:update' || p === 'notifications:create';
    }));
  } else if (roleName === 'Employee') {
    roles.Employee = 2002;
    roleDoc = await getOrCreateRole('employee', ['attendance:read', 'attendance:create', 'leaves:read', 'leaves:create', 'users:read', 'events:read', 'news:read', 'faqs:read', 'files:read', 'applications:read', 'magazines:read', 'photos:read', 'videos:read', 'categories:read', 'departments:read', 'positions:read']);
  } else {
    // User: read-only for content, no users:read (cannot list all users)
    roleDoc = await getOrCreateRole('user', ['news:read', 'faqs:read', 'files:read', 'applications:read', 'events:read', 'magazines:read', 'photos:read', 'videos:read', 'categories:read', 'departments:read', 'positions:read']);
  }

  const user = await User.create({
    username: `testuser_${roleName}_${Date.now()}`,
    email: `test_${roleName}_${Date.now()}@example.com`,
    password: hashedPassword,
    phoneNumber: '1234567890',
    active: true,
    roles,
    role: roleDoc._id
  });
  return user;
};

module.exports = {
  generateTestToken,
  createTestUser
};

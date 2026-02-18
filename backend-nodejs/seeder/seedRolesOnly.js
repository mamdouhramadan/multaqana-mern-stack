/**
 * Seed only the Role collection from roles.json.
 * Permissions are merged: roles.json defines name/slug/isDefault; if permissions
 * are present they are used, otherwise defaults (Admin=all, Editor=content, etc.) apply.
 * Run from backend-nodejs: node seeder/seedRolesOnly.js
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Role = require('../models/Role');
const { PERMISSIONS_FLAT } = require('../config/permissions');

const rolesJsonPath = path.join(__dirname, 'roles.json');

// Default permissions per role (used if roles.json has no permissions array)
const DEFAULT_PERMISSIONS = {
  admin: PERMISSIONS_FLAT,
  editor: PERMISSIONS_FLAT.filter(p => {
    const [res] = p.split(':');
    return ['applications', 'categories', 'events', 'faqs', 'files', 'magazines', 'news', 'photos', 'videos'].includes(res) || p === 'users:read' || p === 'leaves:update' || p === 'notifications:create';
  }),
  employee: ['attendance:read', 'attendance:create', 'leaves:read', 'leaves:create', 'users:read', 'events:read', 'news:read', 'faqs:read', 'files:read', 'applications:read', 'magazines:read', 'photos:read', 'videos:read', 'categories:read', 'departments:read', 'positions:read'],
  user: ['users:read', 'news:read', 'faqs:read', 'files:read', 'applications:read', 'events:read', 'magazines:read', 'photos:read', 'videos:read', 'categories:read', 'departments:read', 'positions:read']
};

async function run() {
  const uri = process.env.DATABASE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/multaqana_db';
  await mongoose.connect(uri);
  console.log('✅ MongoDB Connected'.green.bold);

  try {
    const count = await Role.countDocuments();
    if (count > 0) {
      console.log(`⚠️  Roles already exist (${count}). Skipping. Use -f to force replace.`.yellow);
      if (process.argv[2] !== '-f') {
        await mongoose.disconnect();
        process.exit(0);
      }
      await Role.deleteMany();
    }

    let roles = JSON.parse(fs.readFileSync(rolesJsonPath, 'utf-8'));
    roles = roles.map(r => {
      if (r.permissions && r.permissions.length > 0) return r;
      const perms = DEFAULT_PERMISSIONS[r.slug] || [];
      return { ...r, permissions: perms };
    });
    await Role.create(roles);
    console.log(`✅ Created ${roles.length} roles with permissions.`.green.inverse);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

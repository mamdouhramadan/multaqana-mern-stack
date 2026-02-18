/**
 * One-time migration: apply Roles & Permissions to an existing database.
 *
 * Use this when you already have users (with legacy `roles` object) but no
 * Role collection or User.role yet.
 *
 * 1. Creates Role documents from seeder/roles.json if the Role collection is empty.
 * 2. For each user without a `role` ref: sets user.role from legacy user.roles
 *    (Admin 5150 -> admin role, Editor 1984 -> editor role, else -> default/user role).
 *
 * Run from backend-nodejs: node seeder/migrateRoles.js
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Role = require('../models/Role');
const ROLES_LIST = require('../config/roles_list');

const rolesJsonPath = path.join(__dirname, 'roles.json');

async function run() {
  const uri = process.env.DATABASE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/multaqana_db';
  await mongoose.connect(uri);
  console.log('✅ MongoDB Connected'.green.bold);

  try {
    // 1) Ensure Role collection exists and has data
    let roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      console.log('📦 No roles found. Seeding roles from roles.json...'.yellow);
      const roles = JSON.parse(fs.readFileSync(rolesJsonPath, 'utf-8'));
      await Role.create(roles);
      roleCount = await Role.countDocuments();
      console.log(`   Created ${roleCount} roles.`.green);
    } else {
      console.log(`📦 Roles already exist (${roleCount} roles).`.green);
    }

    const [userRole, editorRole, adminRole] = await Promise.all([
      Role.findOne({ slug: 'user' }).lean(),
      Role.findOne({ slug: 'editor' }).lean(),
      Role.findOne({ slug: 'admin' }).lean(),
    ]);

    if (!userRole || !editorRole || !adminRole) {
      console.error('❌ Expected roles (user, editor, admin) not found.'.red);
      process.exit(1);
    }

    // 2) Users that need migration: no role ref or role is null
    const usersToMigrate = await User.find({
      $or: [{ role: null }, { role: { $exists: false } }],
    }).lean();

    if (usersToMigrate.length === 0) {
      console.log('✅ No users need migration (all have role set).'.green);
      process.exit(0);
    }

    console.log(`👤 Migrating ${usersToMigrate.length} user(s)...`.yellow);

    let updated = 0;
    for (const u of usersToMigrate) {
      const legacy = u.roles || {};
      let roleId = userRole._id; // default

      if (legacy.Admin === ROLES_LIST.Admin) {
        roleId = adminRole._id;
      } else if (legacy.Editor === ROLES_LIST.Editor) {
        roleId = editorRole._id;
      } else if (legacy.User === ROLES_LIST.User || legacy.User != null) {
        roleId = userRole._id;
      }

      await User.updateOne({ _id: u._id }, { $set: { role: roleId } });
      updated++;
    }

    console.log(`✅ Migration complete. Updated ${updated} user(s).`.green.inverse);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

/**
 * Upgrade a user to Admin role so they can access /api/roles and other Admin-only pages.
 * Sets both user.role (ref to Role) and user.roles.Admin (legacy code for JWT).
 *
 * Usage: node seeder/upgradeUserToAdmin.js <email>
 * Example: node seeder/upgradeUserToAdmin.js admin@example.com
 */
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Role = require('../models/Role');
const ROLES_LIST = require('../config/roles_list');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node seeder/upgradeUserToAdmin.js <email>'.red);
  process.exit(1);
}

async function run() {
  const uri = process.env.DATABASE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/multaqana_db';
  await mongoose.connect(uri);
  console.log('✅ MongoDB Connected'.green.bold);

  try {
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      console.error(`❌ No user found with email: ${email}`.red);
      process.exit(1);
    }

    const adminRole = await Role.findOne({ slug: 'admin' });
    if (!adminRole) {
      console.error('❌ Admin role not found. Run: npm run data:seed-roles'.red);
      process.exit(1);
    }

    user.role = adminRole._id;
    user.roles = user.roles || {};
    user.roles.Admin = ROLES_LIST.Admin; // 5150 – used in JWT for verifyRoles(ROLES_LIST.Admin)
    await user.save();

    console.log(`✅ ${email} is now Admin. Log out and log in again so your token is updated.`.green.inverse);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

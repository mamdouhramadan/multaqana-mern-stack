/**
 * One-time script: ensure the Employee role exists in the Role collection.
 * Use when roles were seeded before the Employee role was added to roles.json.
 *
 * Run from backend-nodejs: node seeder/seedEmployeeRole.js
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const Role = require('../models/Role');

const rolesJsonPath = path.join(__dirname, 'roles.json');

async function run() {
  const uri = process.env.DATABASE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/multaqana_db';
  await mongoose.connect(uri);
  console.log('✅ MongoDB Connected'.green.bold);

  try {
    const roles = JSON.parse(fs.readFileSync(rolesJsonPath, 'utf-8'));
    const employeeRole = roles.find((r) => r.slug === 'employee');
    if (!employeeRole) {
      console.error('❌ Employee role not found in roles.json'.red);
      process.exit(1);
    }

    const doc = await Role.findOneAndUpdate(
      { slug: 'employee' },
      { $set: employeeRole },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`✅ Employee role ensured (id: ${doc._id}).`.green.inverse);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

/**
 * Upsert default WordPress-like settings into the Settings collection.
 * Safe to run on an existing DB; only adds or updates these keys.
 *
 * Run from backend-nodejs: node seeder/seedSettingsDefaults.js
 */
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Settings = require('../models/Settings');

const DEFAULTS = [
  { key: 'site_logo', value: '', category: 'Appearance', isPublic: true, description: 'Site logo URL or path (e.g. /img/settings/logo.png).' },
  { key: 'favicon', value: '', category: 'Appearance', isPublic: true, description: 'Favicon URL or path.' },
  { key: 'allow_register', value: true, category: 'General', isPublic: true, description: 'If false, registration is disabled and signup redirects to 404.' },
  { key: 'timezone', value: 'Asia/Dubai', category: 'General', isPublic: true, description: 'Default timezone (e.g. Asia/Dubai).' },
  { key: 'default_role', value: 'user', category: 'System', isPublic: false, description: 'Default role slug for new registrations (display only; backend uses Role.isDefault).' },
];

async function run() {
  const uri = process.env.DATABASE_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/multaqana_db';
  await mongoose.connect(uri);
  console.log('✅ MongoDB Connected'.green.bold);

  try {
    for (const item of DEFAULTS) {
      await Settings.findOneAndUpdate(
        { key: item.key },
        { value: item.value, category: item.category, isPublic: item.isPublic, description: item.description },
        { new: true, upsert: true, runValidators: true }
      );
      console.log(`   Upserted: ${item.key}`);
    }
    console.log('✅ Settings defaults seeded.'.green.inverse);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

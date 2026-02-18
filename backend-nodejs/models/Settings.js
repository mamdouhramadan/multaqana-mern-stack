const mongoose = require('mongoose');

/**
 * Settings Schema
 * Stores application-wide settings and configurations.
 * 
 * Fields:
 * - key: Unique identifier for the setting (e.g., 'site_title', 'maintenance_mode').
 * - value: The actual value. Can be String, Number, Boolean, or JSON object.
 * - category: Grouping for settings (e.g., 'General', 'SEO', 'Email', 'System').
 * - isPublic: Boolean flag. 
 *      - true: Accessible by public/frontend without auth.
 *      - false: Restricted to Admin/Authenticated users (e.g., API keys, SMTP configs).
 * - description: Optional help text explaining what this setting controls.
 */
const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Allows String, Object, Array, etc.
    required: [true, 'Setting value is required']
  },
  category: {
    type: String,
    default: 'General',
    trim: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true // Helps in filtering public settings quickly
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Settings', settingsSchema);

const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Application Model
 * Represents an enterprise application in the system.
 * Contains details like title, logo, description, and related metadata.
 */

const mobileAppSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['ios', 'android', 'huawei'],
    required: true
  },
  storeName: { type: String, required: true },
  storeUrl: { type: String, required: true },
  qrValue: { type: String }
});

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true }
});

const applicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  logo: {
    type: String // Path to image
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  technicalOwner: {
    type: String
  },
  supportEmail: {
    type: String
  },
  mobileApps: [mobileAppSchema],
  attachments: [attachmentSchema],
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

applicationSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);

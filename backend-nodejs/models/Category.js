const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

// Define Category Schema
const categorySchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    default: ""
  },
  // The 'module' field defines which part of the app this category belongs to.
  // This allows us to have a "Technology" category for News and a "Technology" category for Videos independently if needed,
  // or just filter them easily.
  module: {
    type: String,
    required: true,
    enum: ['news', 'magazine', 'faq', 'video', 'album', 'event', 'general'],
    default: 'general'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook to generate slug from title
// Note: We might want the slug to be unique PER module, or globally.
// For simplicity and SEO, globally unique slugs are often safer to avoid collision in shared namespaces.
// If we want scoped uniqueness (e.g. /news/tech vs /video/tech), we'd need compound indexes.
// Let's stick to global uniqueness for now to keep URLs simple (e.g. /category/tech-news).
categorySchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('Category', categorySchema);

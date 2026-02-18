const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const slugify = require('slugify'); // Helper to create URL-friendly strings (e.g. "Hello World" -> "hello-world")

// Define News Schema
const newsSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true, // Slugs must be unique for URLs
    index: true   // Index for faster search
  },
  content: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ""
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Link to the User model
    required: true // Every news item must have an author
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for any extra data (translations, logs, etc.)
    default: {}
  },
  active: {
    type: Boolean,
    default: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save hook to generate slug from title
newsSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next(); // Only regenerate if title changed

  // Create slug: "My Title" -> "my-title"
  // lower: true (lowercase), strict: true (strip special chars)
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('News', newsSchema);

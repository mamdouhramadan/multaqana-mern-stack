const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const photoAlbumSchema = new Schema({
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
  thumbnail: {
    type: String,
    default: "" // Can be the first image in array or separate
  },
  images: {
    type: [String], // Array of image paths
    default: []
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

photoAlbumSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('PhotoAlbum', photoAlbumSchema);

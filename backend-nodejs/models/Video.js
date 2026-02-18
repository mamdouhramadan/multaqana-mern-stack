const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const videoSchema = new Schema({
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
    default: "" // Optional cover image for the video
  },
  videoType: {
    type: String,
    enum: ['file', 'url'],
    required: true
  },
  videoUrl: {
    type: String,
    // Required if videoType is 'url'
    validate: {
      validator: function (v) {
        // If type is url, v must be present. If type is file, v can be empty.
        return this.videoType === 'url' ? !!v : true;
      },
      message: 'Video URL is required when type is URL'
    }
  },
  videoFile: {
    type: String, // Path to uploaded file
    // Required if videoType is 'file'
    validate: {
      validator: function (v) {
        return this.videoType === 'file' ? !!v : true;
      },
      message: 'Video File is required when type is File'
    }
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

videoSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model('Video', videoSchema);

const mongoose = require('mongoose');

/**
 * File Model
 * Represents a generic file uploaded to the system.
 * Used for documents, reports, templates, etc.
 */

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: String // e.g. "2.4 MB" - Could calculate or store bytes
  },
  extension: {
    type: String // e.g. "pdf", "docx"
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('File', fileSchema);

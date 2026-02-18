const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  permissions: {
    type: [String],
    default: []
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

roleSchema.index({ isDefault: 1 });
roleSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);

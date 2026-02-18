const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true // Should be set to midnight of the day
  },
  clockIn: {
    type: Date
  },
  clockOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Leave', 'PublicHoliday', 'Weekend'],
    default: 'Absent'
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  workHours: {
    type: Number,
    default: 0
  },
  note: {
    type: String
  }
}, {
  timestamps: true
});

// Ensure one attendance record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

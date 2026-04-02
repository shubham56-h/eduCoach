const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  }
}, { timestamps: true });

// Prevent duplicate attendance entries for the same schedule, student, and date combo
attendanceSchema.index({ scheduleId: 1, studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  }
}, { timestamps: true });

// Prevent duplicate mark entries for the same test and student combo
markSchema.index({ testId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);

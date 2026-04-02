const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  day: {
    type: String,
    required: true,
    trim: true // E.g., 'Monday', '2023-10-31'
  },
  time: {
    type: String,
    required: true,
    trim: true // E.g., '10:00 AM - 11:30 AM'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Ensure a batch cannot have duplicate schedule entries for the same day and time
scheduleSchema.index({ batchId: 1, day: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);

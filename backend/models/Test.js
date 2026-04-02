const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1
  }
}, { timestamps: true });

// Prevent duplicate tests for the same batch, subject, and date
testSchema.index({ batchId: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Test', testSchema);

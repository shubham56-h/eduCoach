const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // A student can only be in one batch at a time (or omit this if they can be in multiple)
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  }
}, { timestamps: true });

// Optional: compound unique index if a student can be in multiple batches but only once per block
// studentSchema.index({ userId: 1, batchId: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);

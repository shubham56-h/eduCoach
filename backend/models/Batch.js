const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for attached students in this batch
batchSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'batchId',
  justOne: false
});

module.exports = mongoose.model('Batch', batchSchema);

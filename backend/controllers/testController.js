const Test = require('../models/Test');
const Batch = require('../models/Batch');

// @desc    Create a test for a batch
// @route   POST /api/tests
// @access  Private/Faculty
exports.createTest = async (req, res) => {
  try {
    const { batchId, subject, date, maxMarks } = req.body;

    if (!batchId || !subject || !date || !maxMarks) {
      return res.status(400).json({ message: 'Please provide batchId, subject, date, and maxMarks' });
    }

    // Verify batch exists and belongs to this faculty
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    if (batch.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: this batch is not assigned to you' });
    }

    // Check if test already exists for the same batch, subject, and date
    const testExists = await Test.findOne({ batchId, subject, date });
    if (testExists) {
      return res.status(400).json({ message: 'A test for this subject already exists on this date for the batch' });
    }

    const test = await Test.create({
      batchId,
      subject,
      date,
      maxMarks
    });

    res.status(201).json({
      message: 'Test created successfully',
      test
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all tests for a specific batch
// @route   GET /api/tests/batch/:batchId
// @access  Private/Faculty or Admin
exports.getTestsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const tests = await Test.find({ batchId }).sort({ date: -1 });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

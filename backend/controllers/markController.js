const Mark = require('../models/Mark');
const Test = require('../models/Test');
const Batch = require('../models/Batch');

// @desc    Record or update marks for a specific test
// @route   POST /api/marks
// @access  Private/Faculty
exports.recordMarks = async (req, res) => {
  try {
    const { testId, marksRecords } = req.body; 

    if (!testId || !marksRecords || !Array.isArray(marksRecords)) {
      return res.status(400).json({ message: 'Please provide testId and a valid marksRecords array' });
    }

    // Verify test exists and populate batch
    const test = await Test.findById(testId).populate('batchId');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Verify batch exists
    const batch = test.batchId;
    if (!batch) {
      return res.status(404).json({ message: 'Associated batch not found' });
    }

    // Validate marks against maxMarks
    for (let record of marksRecords) {
      if (record.marksObtained < 0 || record.marksObtained > test.maxMarks) {
        return res.status(400).json({ 
          message: `Marks obtained (${record.marksObtained}) for student ${record.studentId} cannot exceed maxMarks (${test.maxMarks}) or be less than 0` 
        });
      }
    }

    // Process marks dynamically using Bulk operations 
    const bulkOps = marksRecords.map(record => ({
      updateOne: {
        filter: { testId: testId, studentId: record.studentId },
        update: { $set: { marksObtained: record.marksObtained } },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Mark.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: 'Marks recorded successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all marks for logged-in student
// @route   GET /api/marks/my-marks
// @access  Private/Student
exports.getMyMarks = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their personal marks history' });
    }

    // Find all mark records for this student and populate the test details
    const marksHistory = await Mark.find({ studentId: req.user._id })
      .populate({
        path: 'testId',
        select: 'subject date maxMarks batchId',
        populate: {
          path: 'batchId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(marksHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all student marks for a specific test (Performance Reporting)
// @route   GET /api/marks/test/:testId
// @access  Private/Faculty or Admin
exports.getTestMarks = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId).populate('batchId', 'name facultyId');
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const marks = await Mark.find({ testId })
      .populate('studentId', 'email')
      .sort({ marksObtained: -1 });

    res.status(200).json({
      testInfo: {
        subject: test.subject,
        date: test.date,
        maxMarks: test.maxMarks,
        batchName: test.batchId.name
      },
      marks
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Test ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all marks (admin) with optional batch/student/test filter
// @route   GET /api/marks
// @access  Private/Admin
exports.getAllMarks = async (req, res) => {
  try {
    const { batchId, studentId, testId } = req.query;

    const filter = {};

    if (testId) {
      filter.testId = testId;
    } else if (batchId) {
      const tests = await Test.find({ batchId }).select('_id');
      const testIds = tests.map(t => t._id);
      if (testIds.length === 0) return res.status(200).json([]);
      filter.testId = { $in: testIds };
    }

    if (studentId) filter.studentId = studentId;

    const marks = await Mark.find(filter)
      .populate('studentId', 'name email')
      .populate({ path: 'testId', select: 'subject date maxMarks batchId', populate: { path: 'batchId', select: 'name' } })
      .sort({ createdAt: -1 });

    res.status(200).json(marks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

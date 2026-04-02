const User = require('../models/User');
const Batch = require('../models/Batch');
const Schedule = require('../models/Schedule');

// @desc    Get system-wide counts
// @route   GET /api/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const [students, faculty, batches, classes] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Batch.countDocuments(),
      Schedule.countDocuments(),
    ]);

    res.status(200).json({ students, faculty, batches, classes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

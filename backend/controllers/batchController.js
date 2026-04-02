const Batch = require('../models/Batch');
const User = require('../models/User');

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Private/Admin
exports.createBatch = async (req, res) => {
  try {
    const { name, facultyId } = req.body;

    if (!name || !facultyId) {
      return res.status(400).json({ message: 'Please provide name and facultyId' });
    }

    // Verify the faculty exists and has the correct role
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    if (faculty.role !== 'faculty') {
      return res.status(400).json({ message: 'Assigned user is not a faculty member' });
    }

    // Check if batch already exists
    const batchExists = await Batch.findOne({ name });
    if (batchExists) {
      return res.status(400).json({ message: 'Batch with this name already exists' });
    }

    const batch = await Batch.create({
      name,
      facultyId
    });

    res.status(201).json({
      message: 'Batch created successfully',
      batch
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const Student = require('../models/Student');

// @desc    Assign a student to a batch (creates/updates Student model)
// @route   POST /api/batches/assign
// @access  Private/Admin
exports.assignStudent = async (req, res) => {
  try {
    const { studentId, batchId } = req.body;

    if (!studentId || !batchId) {
      return res.status(400).json({ message: 'Please provide studentId and batchId' });
    }

    const user = await User.findById(studentId);
    if (!user || user.role !== 'student') {
      return res.status(404).json({ message: 'User not found or is not a student' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if the student assignment already exists, update it if so, otherwise create
    let studentAssignment = await Student.findOne({ userId: studentId });
    
    if (studentAssignment) {
      studentAssignment.batchId = batchId;
      await studentAssignment.save();
    } else {
      studentAssignment = await Student.create({
        userId: studentId,
        batchId: batchId
      });
    }

    res.status(200).json({
      message: 'Student assigned to batch successfully',
      assignment: studentAssignment
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get batch details with populated faculty and students
// @route   GET /api/batches/:id
// @access  Private/Admin
exports.getBatchDetails = async (req, res) => {
  try {
    const batchId = req.params.id;

    // Use Mongoose to find the batch and populate references
    const batch = await Batch.findById(batchId)
      .populate('facultyId', 'name email role')
      .populate({
        path: 'students',
        populate: { path: 'userId', select: 'name email role' }
      });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Faculty can only access their own batch
    if (req.user.role === 'faculty' && batch.facultyId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: this batch is not assigned to you' });
    }

    res.status(200).json(batch);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid Batch ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all batches / Get student's assigned batches
// @route   GET /api/batches
// @access  Private
exports.getBatches = async (req, res) => {
  try {
    const userRole = req.user.role;
    let batches = [];

    if (userRole === 'admin') {
      batches = await Batch.find()
        .populate('facultyId', 'name email role')
        .populate({
          path: 'students',
          populate: { path: 'userId', select: 'name email' }
        });
    } else if (userRole === 'faculty') {
      batches = await Batch.find({ facultyId: req.user._id })
        .populate('facultyId', 'name email role')
        .populate({
          path: 'students',
          populate: { path: 'userId', select: 'name email' }
        });
    } else if (userRole === 'student') {
      const assignment = await Student.findOne({ userId: req.user._id }).populate({
        path: 'batchId',
        populate: { path: 'facultyId', select: 'name email role' }
      });
      if (assignment && assignment.batchId) batches = [assignment.batchId];
    }

    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a batch and all related data
// @route   DELETE /api/batches/:id
// @access  Private/Admin
exports.deleteBatch = async (req, res) => {
  try {
    const Schedule  = require('../models/Schedule');
    const Attendance = require('../models/Attendance');
    const Test      = require('../models/Test');
    const Mark      = require('../models/Mark');
    const Material  = require('../models/Material');

    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const batchId = req.params.id;

    // Find schedules and tests to cascade their children
    const schedules = await Schedule.find({ batchId }).select('_id');
    const scheduleIds = schedules.map(s => s._id);

    const tests = await Test.find({ batchId }).select('_id');
    const testIds = tests.map(t => t._id);

    // Cascade delete in order
    if (scheduleIds.length) await Attendance.deleteMany({ scheduleId: { $in: scheduleIds } });
    if (testIds.length)     await Mark.deleteMany({ testId: { $in: testIds } });

    await Schedule.deleteMany({ batchId });
    await Test.deleteMany({ batchId });
    await Material.deleteMany({ batchId });
    await Student.deleteMany({ batchId });
    await batch.deleteOne();

    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove a student from their batch
// @route   POST /api/batches/unassign
// @access  Private/Admin
exports.unassignStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'Please provide studentId' });

    await Student.deleteOne({ userId: studentId });
    res.status(200).json({ message: 'Student removed from batch' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update batch name and/or faculty
// @route   PUT /api/batches/:id
// @access  Private/Admin
exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const { name, facultyId } = req.body;

    if (name && name !== batch.name) {
      const exists = await Batch.findOne({ name });
      if (exists) return res.status(400).json({ message: 'Batch name already exists' });
      batch.name = name;
    }
    if (facultyId) {
      const faculty = await User.findById(facultyId);
      if (!faculty || faculty.role !== 'faculty') {
        return res.status(400).json({ message: 'Invalid faculty user' });
      }
      batch.facultyId = facultyId;
    }

    await batch.save();
    res.status(200).json({ message: 'Batch updated successfully', batch });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

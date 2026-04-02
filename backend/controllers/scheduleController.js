const Schedule = require('../models/Schedule');
const Batch = require('../models/Batch');
const Student = require('../models/Student');

// @desc    Add a schedule entry to a batch
// @route   POST /api/schedules
// @access  Private/Admin
exports.addSchedule = async (req, res) => {
  try {
    const { batchId, day, time, subject } = req.body;

    if (!batchId || !day || !time || !subject) {
      return res.status(400).json({ message: 'Please provide batchId, day, time, and subject' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const duplicateSchedule = await Schedule.findOne({ batchId, day, time });
    if (duplicateSchedule) {
      return res.status(400).json({ message: 'A schedule entry for this batch on this day and time already exists' });
    }

    const schedule = await Schedule.create({ batchId, day, time, subject });

    res.status(201).json({ message: 'Schedule entry added successfully', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all schedule entries for a specific batch
// @route   GET /api/schedules/batch/:batchId
// @access  Private
exports.getBatchSchedule = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const schedules = await Schedule.find({ batchId });
    res.status(200).json(schedules);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid Batch ID' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get schedule for logged-in student
// @route   GET /api/schedules/my-schedule
// @access  Private/Student
exports.getMySchedule = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their personal schedule' });
    }

    const studentAssignment = await Student.findOne({ userId: req.user._id });
    if (!studentAssignment) {
      return res.status(404).json({ message: 'You have not been assigned to a batch yet' });
    }

    const schedules = await Schedule.find({ batchId: studentAssignment.batchId })
      .populate({ path: 'batchId', select: 'name facultyId', populate: { path: 'facultyId', select: 'name email' } })
      .sort({ day: 1, time: 1 });

    res.status(200).json({ batchId: studentAssignment.batchId, schedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all schedules (admin view)
// @route   GET /api/schedules
// @access  Private/Admin
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate({ path: 'batchId', select: 'name', populate: { path: 'facultyId', select: 'name email' } })
      .sort({ day: 1, time: 1 });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a schedule entry
// @route   DELETE /api/schedules/:id
// @access  Private/Admin
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    await schedule.deleteOne();
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get schedule for logged-in faculty
// @route   GET /api/schedules/faculty-schedule
// @access  Private/Faculty
exports.getFacultySchedule = async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty members can view their teaching schedule' });
    }

    const batches = await Batch.find({ facultyId: req.user._id });
    if (!batches || batches.length === 0) {
      return res.status(404).json({ message: 'You have not been assigned to any batches yet' });
    }

    const batchIds = batches.map(batch => batch._id);
    const schedules = await Schedule.find({ batchId: { $in: batchIds } })
      .populate('batchId', 'name')
      .sort({ day: 1, time: 1 });

    res.status(200).json({ batchesAssigned: batches.length, schedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a schedule entry
// @route   PUT /api/schedules/:id
// @access  Private/Admin
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const { batchId, day, time, subject } = req.body;

    // Check for duplicate if day/time/batch changes
    const newBatchId = batchId || schedule.batchId;
    const newDay     = day     || schedule.day;
    const newTime    = time    || schedule.time;

    if (day || time || batchId) {
      const duplicate = await Schedule.findOne({
        batchId: newBatchId, day: newDay, time: newTime, _id: { $ne: schedule._id }
      });
      if (duplicate) return res.status(400).json({ message: 'A schedule for this batch, day and time already exists' });
    }

    if (batchId) schedule.batchId = batchId;
    if (day)     schedule.day     = day;
    if (time)    schedule.time    = time;
    if (subject) schedule.subject = subject;

    await schedule.save();
    res.status(200).json({ message: 'Schedule updated successfully', schedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

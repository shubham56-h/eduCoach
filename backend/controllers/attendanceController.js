const Attendance = require('../models/Attendance');
const Schedule = require('../models/Schedule');
const Batch = require('../models/Batch');

// @desc    Mark attendance for a specific schedule
// @route   POST /api/attendance
// @access  Private/Faculty
exports.markAttendance = async (req, res) => {
  try {
    const { scheduleId, date, attendanceRecords } = req.body;

    if (!scheduleId || !date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: 'Please provide scheduleId, date, and a valid attendanceRecords array' });
    }

    // Verify schedule exists and populate batch
    const schedule = await Schedule.findById(scheduleId).populate('batchId');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Verify batch exists
    const batch = schedule.batchId;
    if (!batch) {
      return res.status(404).json({ message: 'Associated batch not found' });
    }

    // Verify this schedule belongs to the faculty's batch
    if (batch.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: this schedule does not belong to your batch' });
    }

    // Process attendance dynamically using Bulk operations 
    // This allows creating new attendance records or updating existing ones correctly
    const bulkOps = attendanceRecords.map(record => ({
      updateOne: {
        filter: { scheduleId: scheduleId, studentId: record.studentId, date: date },
        update: { $set: { status: record.status } },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }

    res.status(200).json({ message: 'Attendance marked successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance history for logged-in student
// @route   GET /api/attendance/my-attendance
// @access  Private/Student
exports.getMyAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their personal attendance history' });
    }

    // Find all attendance records for this student
    // Populate the schedule to get the subject, day, and time
    const attendanceHistory = await Attendance.find({ studentId: req.user._id })
      .populate({
        path: 'scheduleId',
        select: 'subject day time batchId',
        // Example: Further populate the batch if needed
        populate: {
          path: 'batchId',
          select: 'name'
        }
      })
      .sort({ date: -1 }); // Sort by newest first

    res.status(200).json(attendanceHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all attendance records (admin) with optional batch/student/subject filter
// @route   GET /api/attendance
// @access  Private/Admin
exports.getAllAttendance = async (req, res) => {
  try {
    const { batchId, studentId, subject } = req.query;

    let scheduleIds;
    if (batchId || subject) {
      const scheduleFilter = {};
      if (batchId)  scheduleFilter.batchId  = batchId;
      if (subject)  scheduleFilter.subject  = { $regex: subject, $options: 'i' };
      const schedules = await Schedule.find(scheduleFilter).select('_id');
      scheduleIds = schedules.map(s => s._id);
      if (scheduleIds.length === 0) return res.status(200).json([]);
    }

    const filter = {};
    if (scheduleIds) filter.scheduleId = { $in: scheduleIds };
    if (studentId)   filter.studentId  = studentId;

    const records = await Attendance.find(filter)
      .populate('studentId', 'name email')
      .populate({ path: 'scheduleId', select: 'subject day time batchId', populate: { path: 'batchId', select: 'name' } })
      .sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance records for faculty's own batch
// @route   GET /api/attendance/my-batch
// @access  Private/Faculty
exports.getBatchAttendance = async (req, res) => {
  try {
    const { studentId, subject } = req.query;

    // Find faculty's batch
    const Batch = require('../models/Batch');
    const batch = await Batch.findOne({ facultyId: req.user._id });
    if (!batch) return res.status(200).json([]);

    const scheduleFilter = { batchId: batch._id };
    if (subject) scheduleFilter.subject = { $regex: subject, $options: 'i' };

    const schedules = await Schedule.find(scheduleFilter).select('_id');
    const scheduleIds = schedules.map(s => s._id);
    if (scheduleIds.length === 0) return res.status(200).json([]);

    const filter = { scheduleId: { $in: scheduleIds } };
    if (studentId) filter.studentId = studentId;

    const records = await Attendance.find(filter)
      .populate('studentId', 'name email')
      .populate({ path: 'scheduleId', select: 'subject day time batchId', populate: { path: 'batchId', select: 'name' } })
      .sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// @access  Private/Admin
exports.getScheduleAttendance = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { date } = req.query; // Expect the date as a query parameter ?date=YYYY-MM-DD

    if (!scheduleId || !date) {
      return res.status(400).json({ message: 'Please provide both scheduleId in the URL and date in the query parameters (e.g., ?date=YYYY-MM-DD)' });
    }

    const attendanceRecords = await Attendance.find({ scheduleId, date })
      .populate('studentId', 'email role')
      .populate('scheduleId', 'day time subject'); // populate basic schedule info

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this schedule on the given date' });
    }

    // Calculate Summary
    const summary = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter(record => record.status === 'Present').length,
      absent: attendanceRecords.filter(record => record.status === 'Absent').length
    };

    res.status(200).json({
      summary,
      date,
      records: attendanceRecords
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Schedule ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

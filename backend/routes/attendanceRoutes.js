const express = require('express');
const router = express.Router();
const { markAttendance, getMyAttendance, getScheduleAttendance, getAllAttendance, getBatchAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('faculty'), markAttendance);
router.get('/', protect, authorize('admin'), getAllAttendance);
router.get('/my-attendance', protect, authorize('student'), getMyAttendance);
router.get('/my-batch', protect, authorize('faculty'), getBatchAttendance);
router.get('/schedule/:scheduleId', protect, authorize('admin'), getScheduleAttendance);

module.exports = router;

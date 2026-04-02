const express = require('express');
const router = express.Router();
const { addSchedule, getBatchSchedule, getMySchedule, getFacultySchedule, getAllSchedules, deleteSchedule, updateSchedule } = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), addSchedule);
router.get('/', protect, authorize('admin'), getAllSchedules);
router.put('/:id', protect, authorize('admin'), updateSchedule);
router.delete('/:id', protect, authorize('admin'), deleteSchedule);
router.get('/batch/:batchId', protect, getBatchSchedule);
router.get('/my-schedule', protect, authorize('student'), getMySchedule);
router.get('/faculty-schedule', protect, authorize('faculty'), getFacultySchedule);

module.exports = router;

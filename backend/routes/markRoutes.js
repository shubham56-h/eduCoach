const express = require('express');
const router = express.Router();
const { recordMarks, getMyMarks, getTestMarks, getAllMarks } = require('../controllers/markController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('faculty'), recordMarks);
router.get('/', protect, authorize('admin'), getAllMarks);
router.get('/my-marks', protect, authorize('student'), getMyMarks);
router.get('/test/:testId', protect, authorize('admin', 'faculty'), getTestMarks);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createTest, getTestsByBatch } = require('../controllers/testController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route to create a test (Faculty only)
router.post('/', protect, authorize('faculty'), createTest);

// Route to get all tests for a batch (Faculty/Admin)
router.get('/batch/:batchId', protect, authorize('faculty', 'admin'), getTestsByBatch);

module.exports = router;

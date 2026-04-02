const express = require('express');
const router = express.Router();
const { createBatch, assignStudent, unassignStudent, getBatchDetails, getBatches, deleteBatch, updateBatch } = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createBatch);
router.get('/', protect, getBatches);
router.post('/assign', protect, authorize('admin'), assignStudent);
router.post('/unassign', protect, authorize('admin'), unassignStudent);
router.get('/:id', protect, authorize('admin', 'faculty'), getBatchDetails);
router.put('/:id', protect, authorize('admin'), updateBatch);
router.delete('/:id', protect, authorize('admin'), deleteBatch);

module.exports = router;

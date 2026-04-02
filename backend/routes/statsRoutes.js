const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getStats);

module.exports = router;

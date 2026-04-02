const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const { uploadMaterial, getBatchMaterials, getMyMaterials, deleteMaterial } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('faculty'), upload.single('file'), uploadMaterial);
router.get('/my-materials', protect, authorize('student'), getMyMaterials);
router.get('/batch/:batchId', protect, getBatchMaterials);
router.delete('/:id', protect, authorize('faculty'), deleteMaterial);

module.exports = router;

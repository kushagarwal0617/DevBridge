const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');
const { uploadFile, getProjectFiles, deleteFile } = require('../controllers/fileController');

const upload = multer({ storage });

router.use(protect);

// "file" here must match the field name the frontend uses when building its upload request
router.post('/:projectId', upload.single('file'), uploadFile);
router.get('/:projectId', getProjectFiles);
router.delete('/:id', deleteFile);

module.exports = router;
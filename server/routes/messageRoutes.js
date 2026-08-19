const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProjectMessages } = require('../controllers/messageController');

router.use(protect);

router.get('/:projectId', getProjectMessages);

module.exports = router;
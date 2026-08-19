const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProjectAnalytics } = require('../controllers/analyticsController');

router.use(protect);

router.get('/:projectId', getProjectAnalytics);

module.exports = router;
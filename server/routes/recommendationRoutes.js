const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRecommendations, updateInterests } = require('../controllers/recommendationController');

router.use(protect);

router.get('/', getRecommendations);
router.patch('/interests', updateInterests);

module.exports = router;
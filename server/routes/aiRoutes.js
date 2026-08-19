const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { explain, debug, docs, summarize } = require('../controllers/aiController');

router.use(protect);

router.post('/explain', explain);
router.post('/debug', debug);
router.post('/docs', docs);
router.post('/summarize', summarize);

module.exports = router;
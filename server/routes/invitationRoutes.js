const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyInvitations, respondToInvitation } = require('../controllers/invitationController');

router.use(protect);

router.get('/my', getMyInvitations);
router.patch('/:id/respond', respondToInvitation);

module.exports = router;
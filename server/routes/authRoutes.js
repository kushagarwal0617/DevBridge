const express = require('express');
const router = express.Router();
const { register, login, getMe, googleLogin, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.patch('/password', protect, changePassword);

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateTask, deleteTask } = require('../controllers/taskController');

router.use(protect);

router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
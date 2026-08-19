const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  createProject,
  getMyProjects,
  getProjectById,
  inviteMember,
  deleteProject,
} = require('../controllers/projectController');

const {
  createTask,
  getProjectTasks,
} = require('../controllers/taskController');

router.use(protect);

router.post('/', createProject);
router.get('/', getMyProjects);
router.get('/:id', getProjectById);
router.delete('/:id', deleteProject);
router.post('/:id/invite', inviteMember);

router.post('/:projectId/tasks', createTask);
router.get('/:projectId/tasks', getProjectTasks);

module.exports = router;
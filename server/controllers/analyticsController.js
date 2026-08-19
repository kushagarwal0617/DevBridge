const Task = require('../models/Task');
const Project = require('../models/Project');

const getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some((m) => m.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You are not a member of this project' });

    const totalTasks = await Task.countDocuments({ project: projectId });
    const todoCount = await Task.countDocuments({ project: projectId, status: 'todo' });
    const inProgressCount = await Task.countDocuments({ project: projectId, status: 'in-progress' });
    const doneCount = await Task.countDocuments({ project: projectId, status: 'done' });

    const completionPercent = totalTasks === 0 ? 0 : Math.round((doneCount / totalTasks) * 100);

    res.status(200).json({
      totalTasks,
      todoCount,
      inProgressCount,
      doneCount,
      completionPercent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProjectAnalytics };
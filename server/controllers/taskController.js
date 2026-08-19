const Task = require('../models/Task');
const Project = require('../models/Project');

const assertMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, code: 404, message: 'Project not found' };
  const isMember = project.members.some((m) => m.toString() === userId);
  if (!isMember) return { ok: false, code: 403, message: 'You are not a member of this project' };
  return { ok: true, project };
};

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, deadline } = req.body;
    const { projectId } = req.params;

    const check = await assertMembership(projectId, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await Task.create({
      project: projectId,
      title,
      description,
      assignedTo: assignedTo || null,
      deadline: deadline || null,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const check = await assertMembership(projectId, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const check = await assertMembership(task.project, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const { title, description, assignedTo, status, deadline } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status !== undefined) task.status = status;
    if (deadline !== undefined) task.deadline = deadline;

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const check = await assertMembership(task.project, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTask, getProjectTasks, updateTask, deleteTask };
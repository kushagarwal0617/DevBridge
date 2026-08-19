const Project = require('../models/Project');
const Task = require('../models/Task');
const Message = require('../models/Message');
const File = require('../models/File');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { createNotification } = require('../services/notificationService');

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Project title is required' });
    }

    const project = await Project.create({
      title,
      description,
      owner: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some((m) => m._id.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can invite members' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    if (project.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Prevent sending the same invite twice while one is still pending
    const existingInvite = await Invitation.findOne({
      project: project._id,
      invitedUser: userToInvite._id,
      status: 'pending',
    });
    if (existingInvite) {
      return res.status(400).json({ message: 'An invitation is already pending for this user' });
    }

    const invitation = await Invitation.create({
      project: project._id,
      invitedUser: userToInvite._id,
      invitedBy: req.user.id,
    });
    await createNotification({
  recipient: userToInvite._id,
  type: 'invite',
  message: `You were invited to join "${project.title}"`,
  project: project._id,
});

    res.status(201).json({ message: 'Invitation sent', invitation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the project owner can delete this project' });
    }

    // Clean up everything that belongs to this project, not just the project itself
    await Task.deleteMany({ project: project._id });
    await Message.deleteMany({ project: project._id });
    await File.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createProject, getMyProjects, getProjectById, inviteMember, deleteProject };
      
const Message = require('../models/Message');
const Project = require('../models/Project');

const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some((m) => m.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You are not a member of this project' });

    const messages = await Message.find({ project: projectId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 }); // oldest first, so chat reads top-to-bottom naturally

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProjectMessages };
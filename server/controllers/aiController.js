const { explainCode, debugCode, generateDocs, summarizeChat } = require('../services/aiService');
const Project = require('../models/Project');
const Message = require('../models/Message');

const assertMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, code: 404, message: 'Project not found' };
  const isMember = project.members.some((m) => m.toString() === userId);
  if (!isMember) return { ok: false, code: 403, message: 'You are not a member of this project' };
  return { ok: true };
};

const explain = async (req, res) => {
  try {
    const { projectId, code, question } = req.body;
    const check = await assertMembership(projectId, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });
    if (!code || !question) {
      return res.status(400).json({ message: 'Code and question are required' });
    }
    const answer = await explainCode(code, question);
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'AI request failed', error: error.message });
  }
};

const debug = async (req, res) => {
  try {
    const { projectId, code, errorDescription } = req.body;
    const check = await assertMembership(projectId, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });
    if (!code || !errorDescription) {
      return res.status(400).json({ message: 'Code and error description are required' });
    }
    const answer = await debugCode(code, errorDescription);
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'AI request failed', error: error.message });
  }
};

const docs = async (req, res) => {
  try {
    const { projectId, code } = req.body;
    const check = await assertMembership(projectId, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });
    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }
    const answer = await generateDocs(code);
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'AI request failed', error: error.message });
  }
};

const summarize = async (req, res) => {
  try {
    const { projectId } = req.body;
    const check = await assertMembership(projectId, req.user.id);
    if (!check.ok) return res.status(check.code).json({ message: check.message });

    const recentMessages = await Message.find({ project: projectId })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(30);

    if (recentMessages.length === 0) {
      return res.status(400).json({ message: 'No messages to summarize yet' });
    }

    const messagesText = recentMessages
      .reverse()
      .map((m) => `${m.sender.name}: ${m.text}`)
      .join('\n');

    const answer = await summarizeChat(messagesText);
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ message: 'AI request failed', error: error.message });
  }
};

module.exports = { explain, debug, docs, summarize };
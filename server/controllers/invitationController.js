const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const { createNotification } = require('../services/notificationService');

// Get all pending invitations for the logged-in user (shown on their Dashboard)
const getMyInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      invitedUser: req.user.id,
      status: 'pending',
    })
      .populate('project', 'title description')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept or decline an invitation
const respondToInvitation = async (req, res) => {
  try {
    const { action } = req.body; // expected: 'accept' or 'decline'
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Only the person who was actually invited can respond to it
    if (invitation.invitedUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'This invitation is not addressed to you' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'This invitation has already been responded to' });
    }

    if (action === 'accept') {
      invitation.status = 'accepted';
      await invitation.save();

      // Now actually add them to the project's members list
      const project = await Project.findById(invitation.project);
      if (!project.members.includes(req.user.id)) {
        project.members.push(req.user.id);
        await project.save();
      }
      const acceptingUser = await require('../models/User').findById(req.user.id);

await createNotification({
  recipient: invitation.invitedBy,
  type: 'invite_accepted',
  message: `${acceptingUser.name} accepted your invite to "${project.title}"`,
  project: project._id,
});

      return res.status(200).json({ message: 'Invitation accepted', invitation });
    }

    if (action === 'decline') {
      invitation.status = 'declined';
      await invitation.save();
      return res.status(200).json({ message: 'Invitation declined', invitation });
    }

    return res.status(400).json({ message: "Action must be 'accept' or 'decline'" });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMyInvitations, respondToInvitation };
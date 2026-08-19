const Resource = require('../models/Resource');
const User = require('../models/User');

const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.interests || user.interests.length === 0) {
      return res.status(200).json({
        message: 'Add some interests to your profile to get personalized recommendations',
        resources: [],
      });
    }

    // Find resources where at least one tag matches at least one of the user's interests
    const resources = await Resource.find({
      tags: { $in: user.interests },
    });

    res.status(200).json({ resources });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Lets a logged-in user update their own interests
const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({ message: 'Interests must be an array of strings' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { interests },
      { new: true } // return the updated document, not the old one
    ).select('-password');

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getRecommendations, updateInterests };
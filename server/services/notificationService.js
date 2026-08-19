const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, message, project = null }) => {
  try {
    await Notification.create({ recipient, type, message, project });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = { createNotification };
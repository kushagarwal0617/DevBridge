const Message = require('../models/Message');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // When a user opens a project's chat, they "join" that project's room
    socket.on('joinProject', (projectId) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined project room ${projectId}`);
    });

    // When a user sends a message
    socket.on('sendMessage', async ({ projectId, senderId, senderName, text }) => {
      try {
        // Save it permanently to MongoDB first
        const savedMessage = await Message.create({
          project: projectId,
          sender: senderId,
          text,
        });

        // Then broadcast it to everyone in that project's room, including the sender
        io.to(projectId).emit('receiveMessage', {
          _id: savedMessage._id,
          text: savedMessage.text,
          sender: { _id: senderId, name: senderName },
          createdAt: savedMessage.createdAt,
        });
      } catch (error) {
        console.error('Error saving message:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = initSocket;
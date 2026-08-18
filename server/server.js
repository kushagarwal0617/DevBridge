require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const messageRoutes = require('./routes/messageRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const fileRoutes = require('./routes/fileRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const initSocket = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app); // the raw HTTP server, shared by Express AND Socket.IO

const io = new Server(server, {
  cors: {
    origin: '*', // during development, allow any frontend origin
    methods: ['GET', 'POST'],
  },
});

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('DevBridge API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
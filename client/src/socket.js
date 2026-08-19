import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  autoConnect: false, // we connect manually once we know the user is logged in
});

export default socket;
import { Server } from 'socket.io';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinRoom', ({ roomId }) => {
      socket.join(roomId);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('typingUser', ({ roomId }) => {
      console.log('User typing');
      socket.to(roomId).emit('typingUser');
    });

    socket.on('stopTypingUser', ({ roomId }) => {
      console.log('User stopped typing');
      socket.to(roomId).emit('stopTypingUser');
    });

    socket.on('typingHotel', ({ roomId }) => {
      console.log('Hotel typing');
      socket.to(roomId).emit('typingHotel');
    });

    socket.on('stopTypingHotel', ({ roomId }) => {
      console.log('Hotel stopped typing');
      socket.to(roomId).emit('stopTypingHotel');
    });
  });

  return io;
};

export default configureSocket;

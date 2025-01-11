import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

export default function setupSocketServer(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', socket => {
    console.log('Socket work!', socket.id);
  });

  return io;
}

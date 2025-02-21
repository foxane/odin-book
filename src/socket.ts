import { Socket, Server, type ExtendedError } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prismaClient';
import type { IServer } from 'types/socket';

const SECRET = process.env.JWT_SECRET;

export const socketAuth = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  const token = socket.handshake.auth['token'];
  if (!token)
    return next(new Error('Authentication error: token not provided'));

  try {
    const { id } = jwt.verify(token, SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return next(new Error('Authentication error: user not found'));

    socket.data.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error('Authentication error: token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error('Authentication error: token malformed'));
    } else {
      return next(new Error('Authentication error'));
    }
  }
};

let io: IServer;

export const initializeSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: { origin: '*' },
  });

  io.use(socketAuth);
  io.on('connection', socket => {
    const { user } = socket.data;
    socket.join(`user_${user.id}`);

    console.log(user.name, 'Joined');
    console.log('connected clients :', io.sockets.sockets.size);

    socket.on('disconnect', reason => {
      console.log(`${user.name} disconnected due to: ${reason}`);
    });

    /**
     * Events
     */
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

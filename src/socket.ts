import { Socket, Server, type ExtendedError } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prismaClient';
import type { IServer } from 'types/socket';
import type { Notification } from '@prisma/client';

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
const onlineUsers = new Map<string, Set<string>>();

export const initializeSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: { origin: '*' },
  });

  io.use(socketAuth);
  io.on('connection', socket => {
    const { user } = socket.data;
    socket.join(`user_${user.id}`);

    // Create new set if not exist
    if (!onlineUsers.has(user.id)) {
      onlineUsers.set(user.id, new Set());
    }
    onlineUsers.get(user.id)!.add(socket.id);

    console.log(user.name, 'joined.', onlineUsers);

    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(user.id);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          // Truly disconnect, no other socket connected
          onlineUsers.delete(user.id);
        }
      }

      console.log(`${user.name} disconnected. Online users:`, onlineUsers);
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

export const socketService = {
  sendNotif: (id: string, notif: Notification) => {
    getIO().to(`user_${id}`).emit('newNotification', notif);
  },
};

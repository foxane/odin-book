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
    const { id } = jwt.verify(token, SECRET) as { id: number };
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
    if (!onlineUsers.has(user.id.toString())) {
      onlineUsers.set(user.id.toString(), new Set());
    }
    onlineUsers.get(user.id.toString())!.add(socket.id);

    console.log(user.name, 'joined.', onlineUsers);

    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(user.id.toString());
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          // Truly disconnect, no other socket connected
          onlineUsers.delete(user.id.toString());
        }
      }

      console.log(`${user.name} disconnected. Online users:`, onlineUsers);
    });

    /**
     * ===================== Message events =======================
     */

    socket.on('createChat', async targetId => {
      let chat = await prisma.chat.findFirst({
        where: {
          member: { every: { id: { in: [targetId, user.id] } } },
        },
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: { member: { connect: [{ id: targetId }, { id: user.id }] } },
        });
      }

      socket.emit('chatCreated', chat); // Send back to creator
      socket.to(`user_${user.id}`).emit('newChat', chat);
      socket.to(`user_${targetId}`).emit('newChat', chat); // Notify other user
    });

    socket.on('sendMessage', async e => {
      const chatId = e.chatId;

      /**
       * Upload to bucket on prod. save to storage on dev
       * To be added later
       * ...
       */

      const message = await prisma.message.create({
        include: { user: { select: { id: true, name: true, avatar: true } } },
        data: {
          chatId,
          text: e.message.text,
          userId: user.id,
        },
      });

      socket.emit('newMessage', { chatId, message });
      socket.to(`user_${e.targetId}`).emit('newMessage', { chatId, message });
    });

    socket.on('readChat', async chatId => {
      await prisma.message.updateMany({
        data: { status: 'READ', readAt: new Date() },
        where: { chatId, userId: { not: user.id } }, // All received msg
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Functions to send notification anywhere on the app
 */
export const socketService = {
  sendNotif: (id: string, notif: Notification) => {
    getIO().to(`user_${id}`).emit('newNotification', notif);
  },
};

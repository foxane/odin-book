import { Socket, Server, type ExtendedError } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prismaClient';
import type { IServer } from 'types/socket';
import type { Notification } from '@prisma/client';
import type { ChatSummary } from './controller/chat.controller';

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
  io.on('connection', async socket => {
    const { user } = socket.data;
    socket.join(`user_${user.id}`);

    // Create new set if not exist
    if (!onlineUsers.has(user.id.toString())) {
      onlineUsers.set(user.id.toString(), new Set());
    }
    onlineUsers.get(user.id.toString())!.add(socket.id);
    console.log('connected count: ', io.engine.clientsCount);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: null },
    });

    socket.on('disconnect', async () => {
      const userSockets = onlineUsers.get(user.id.toString());
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          /**
           * Truly disconnect, no other socket connected
           * */
          onlineUsers.delete(user.id.toString());
          await prisma.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date() },
          });
        }
      }
      console.log('disconnected count: ', onlineUsers);
    });

    /**
     * ===================== Message events =======================
     */

    socket.on('createChat', async (targetId, ack) => {
      let chat = await prisma.chat.findFirst({
        where: { member: { every: { id: { in: [targetId, user.id] } } } },
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: { member: { connect: [{ id: targetId }, { id: user.id }] } },
        });
      }

      const data = await prisma.chat.findUniqueOrThrow({
        where: { id: chat.id },
        include: {
          // Other user
          member: {
            where: { id: { not: user.id } },
            select: { id: true, name: true, avatar: true },
          },

          // Last message
          message: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
          },

          // Unread count
          _count: {
            select: {
              message: {
                where: {
                  userId: { not: user.id },
                  status: 'UNREAD',
                },
              },
            },
          },
        },
      });

      const result: ChatSummary = {
        id: data.id,
        lastMessage: data.message[0] ?? null,
        otherUser: data.member[0],
        unreadCount: data._count.message,
      };

      ack(result);
      socket.emit('newChat', result);
      socket.to(`user_${targetId}`).emit('newChat', result); // Notify other user
    });

    socket.on('sendMessage', async (payload, ack) => {
      const chatId = payload.chatId;
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: { member: { select: { id: true } } },
      });
      if (!chat) return;

      /**
       * Upload to bucket on prod. save to storage on dev
       * To be added later
       * ...
       */

      const message = await prisma.message.create({
        include: { user: { select: { id: true, name: true, avatar: true } } },
        data: {
          chatId,
          text: payload.message.text,
          userId: user.id,
        },
      });

      ack(message);
      socket.emit('newMessage', message);
      socket
        .to(`user_${chat.member.find(u => u.id !== user.id)!.id}`)
        .emit('newMessage', message);
    });

    socket.on('markChatAsRead', async chatId => {
      const [_, chat] = await prisma.$transaction([
        prisma.message.updateMany({
          data: { status: 'READ', readAt: new Date() },
          where: { chatId, userId: { not: user.id } }, // All received msg
        }),
        prisma.chat.findUnique({
          where: { id: chatId },
          include: { member: { select: { id: true } } },
        }),
      ]);

      const otherUser = chat!.member.find(el => el.id !== user.id);

      socket.to(`user_${otherUser!.id}`).emit('readChat', chat!.id);
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

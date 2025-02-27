import { prisma } from '@/lib/prismaClient';
import { type Message } from '@prisma/client';
import type { RequestHandler } from 'express';

/**
 * Chat model with additional metadata for preview purposes
 */
export interface ChatSummary {
  id: number;
  lastMessage: Message | null;
  unreadCount: number;
  otherUser: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

export const getAllChat: RequestHandler = async (req, res) => {
  const chats = await prisma.chat.findMany({
    where: {
      member: { some: { id: req.user.id } },
    },
    include: {
      // Other user
      member: {
        where: { id: { not: req.user.id } },
        select: { id: true, name: true, avatar: true },
      },

      // Last message
      message: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },

      // Unread count
      _count: {
        select: {
          message: {
            where: {
              userId: { not: req.user.id },
              status: 'UNREAD',
            },
          },
        },
      },
    },
  });

  const chatSummaries: ChatSummary[] = chats.map(chat => {
    const { id, _count, member, message } = chat;
    const result: ChatSummary = {
      id,
      lastMessage: message[0] ?? null,
      otherUser: member[0],
      unreadCount: _count.message,
    };

    return result;
  });

  res.json(chatSummaries);
};

export const createPrivateChat: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const targetId = req.query['u'] as string;
  if (!targetId) {
    res.status(400).json({ message: 'userId query not provided' });
    return;
  }

  const existingChat = await prisma.chat.findFirst({
    where: {
      member: { every: { id: { in: [userId, parseInt(targetId)] } } },
    },
  });

  if (existingChat) {
    res.json(existingChat);
    return;
  }

  const newChat = await prisma.chat.create({
    data: {
      member: {
        connect: [{ id: userId }, { id: parseInt(targetId) }],
      },
    },
    include: { member: { select: { id: true, avatar: true, name: true } } },
  });

  res.status(201).json(newChat);
};

export const getMessageByChat: RequestHandler = async (req, res) => {
  const chatId = req.params['chatId']!;

  const msgs = await prisma.message.findMany({
    where: { chatId: parseInt(chatId) },
    include: {
      user: { select: { id: true, avatar: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(msgs);
};

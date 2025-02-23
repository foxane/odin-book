import { prisma } from '@/lib/prismaClient';
import { cleanManyUser } from '@/lib/user';
import { createCursor } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import type { RequestHandler } from 'express';

export const getAllChat: RequestHandler = async (req, res) => {
  const { cursor, take } = req.query as { cursor?: string; take?: string };

  const filter = createCursor<Prisma.ChatFindManyArgs>(
    cursor ? parseInt(cursor) : '',
    take,
  );

  const chat = await prisma.chat.findMany({
    ...filter,
    where: {
      member: { some: { id: req.user.id } },
    },
    include: { member: true },
  });

  res.json(chat.map(r => ({ ...r, member: cleanManyUser(r.member) })));
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
  });

  res.json(msgs);
};

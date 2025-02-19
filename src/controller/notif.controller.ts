import { prisma } from '@/lib/prismaClient';
import { createCursor } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import type { RequestHandler } from 'express';

export const getAll: RequestHandler = async (req, res) => {
  const { user } = req;
  const { cursor, take } = req.query as { cursor?: string; take?: string };

  const filter = createCursor<Prisma.NotificationFindManyArgs>(
    cursor ? parseInt(cursor) : '',
    take,
  );

  const notifs = await prisma.notification.findMany({
    ...filter,
    where: { receiverId: user.id },
    orderBy: [{ isRead: 'asc' }, { date: 'desc' }],
    include: {
      actor: { select: { name: true, avatar: true } },
      post: { select: { text: true } },
      comment: { select: { text: true } },
    },
  });

  const unreadCount = await prisma.notification.count({
    where: { receiverId: user.id, isRead: false },
  });

  res.json({ notifications: notifs, unreadCount });
};

export const read: RequestHandler = async (req, res) => {
  const { notifId } = req.params;

  await prisma.notification.update({
    where: { id: parseInt(notifId) },
    data: { isRead: true },
  });

  res.status(204).end();
};

export const readAll: RequestHandler = async (req, res) => {
  await prisma.notification.updateMany({
    where: { receiverId: req.user.id },
    data: { isRead: true },
  });

  res.status(204).end();
};

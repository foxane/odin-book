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

  const notifs = prisma.notification.findMany({
    ...filter,
    where: { receiverId: user.id },
  });

  res.json(notifs);
};

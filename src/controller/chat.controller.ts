import { prisma } from '@/lib/prismaClient';
import { cleanManyUser } from '@/lib/user';
import { createCursor } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import type { RequestHandler } from 'express';

export const getAllChat: RequestHandler = async (req, res) => {
  const { cursor, take } = req.query as { cursor?: string; take?: string };

  const filter = createCursor<Prisma.RoomFindManyArgs>(
    cursor ? parseInt(cursor) : '',
    take,
  );

  const room = await prisma.room.findMany({
    ...filter,
    where: {
      users: { some: { id: req.user.id } },
    },
    include: { users: true },
  });

  res.json(room.map(r => ({ ...r, users: cleanManyUser(r.users) })));
};

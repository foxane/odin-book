import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '@/lib/prismaClient';

export const authenticate: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(403).json({ message: 'Token not provided' });
    return;
  }

  const { id } = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  req.user = user;
  next();
};

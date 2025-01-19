import { prisma } from '@/lib/prisma';
import { cleanUser } from '@/lib/utils';
import type { RequestHandler } from 'express';

export const getAllUser: RequestHandler = async (req, res, next) => {
  const { name } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: { name: { contains: name as string } },
    });
    res.json(users.map(el => cleanUser(el)));
  } catch (error) {
    next(error);
  }
};

export const getSingleUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params['id'] },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(cleanUser(user));
  } catch (error) {
    next(error);
  }
};

export const updateUser: RequestHandler = async (req, res, next) => {
  const userId = req.params['id'];

  if (req.user && req.user.id !== userId) {
    res.status(403).json({ message: 'Unauthorized' });
  }

  const { name, email, avatar } = req.body as {
    name: string;
    email: string;
    avatar: string;
  };

  const changes = {
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(avatar ? { avatar } : {}),
  };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: changes,
    });

    res.json(cleanUser(updatedUser));
  } catch (error) {
    next(error);
  }
};

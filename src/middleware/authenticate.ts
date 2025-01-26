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

export const verifyPostExist: RequestHandler = async (req, res, next) => {
  // Skip when postId don't exist
  if (!req.params['postId']) {
    return next();
  }

  const postId = Number(req.params['postId']);
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: true,
      _count: { select: { likedBy: true } },
    },
  });

  if (!post) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }

  req.post = post;
  next();
};

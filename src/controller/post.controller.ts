import type { RequestHandler } from 'express';
import type { User } from '@prisma/client';

import { prisma } from '@/lib/prismaClient';
import { createPostFilter, sanitizeText } from '@/lib/post';
import { cleanManyUser, cleanUser } from '@/lib/user';

export const createPost: RequestHandler = async (req, res) => {
  const { text } = req.body as { text: string };

  const post = await prisma.post.create({
    data: { text: sanitizeText(text), user: { connect: { id: req.user.id } } },
  });

  res.status(201).json(post);
};

export const getAllPost: RequestHandler = async (req, res) => {
  const posts = await prisma.post.findMany({
    ...createPostFilter(req.query),
    include: {
      user: true,
      _count: { select: { likedBy: true } },
    },
  });

  for (const p of posts) {
    p.user = cleanUser(p.user) as User;
  }

  res.json(posts);
};

export const getSinglePost: RequestHandler = async (req, res) => {
  const postId = req.post.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: true,
      _count: { select: { likedBy: true } },
    },
  });

  if (post) post.user = cleanUser(post?.user) as User;
  res.json(post);
};

export const getPostByUser: RequestHandler = async (req, res) => {
  const userId = req.params['userId'];

  const posts = await prisma.post.findMany({
    where: { userId },
    include: {
      _count: { select: { likedBy: true } },
    },
  });

  res.json(posts);
};

export const updatePost: RequestHandler = async (req, res) => {
  const { text } = req.body;
  const { post } = req;

  if (post.userId !== req.user.id) {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  const updatedPost = await prisma.post.update({
    where: { id: post.id },
    data: { text: sanitizeText(text) },
    include: {
      _count: { select: { likedBy: true } },
    },
  });

  res.json(updatedPost);
};

export const deletePost: RequestHandler = async (req, res) => {
  const { post } = req;

  if (post.userId !== req.user.id) {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  await prisma.post.delete({ where: { id: post.id } });

  res.status(204).end();
};

export const getLikedBy: RequestHandler = async (req, res) => {
  const { post } = req;

  const target = await prisma.post.findUnique({
    where: { id: post.id },
    select: { likedBy: true },
  });

  res.json(target ? cleanManyUser(target?.likedBy) : []);
};

export const likePost: RequestHandler = async (req, res) => {
  const { post } = req;
  const userId = req.user.id;

  await prisma.post.update({
    where: { id: post.id },
    data: { likedBy: { connect: { id: userId } } },
  });

  res.status(204).end();
};

export const unlikePost: RequestHandler = async (req, res) => {
  const { post } = req;
  const userId = req.user.id;

  await prisma.post.update({
    where: { id: post.id },
    data: { likedBy: { disconnect: { id: userId } } },
  });

  res.status(204).end();
};

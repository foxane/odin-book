import type { RequestHandler } from 'express';
import type { User } from '@prisma/client';

import { prisma } from '@/lib/prismaClient';
import { appendIsLiked, createPostFilter, sanitizeText } from '@/lib/post';
import { cleanManyUser, cleanUser } from '@/lib/user';
import { getFileUrl } from '@/lib/utils';
import { uploadToBucket } from '@/middleware/bucket';

export const createPost: RequestHandler = async (req, res) => {
  const { text } = req.body as { text: string };

  if (req.file && process.env.NODE_ENV === 'production') {
    const publicUrl = await uploadToBucket(req.file, req.user.id);
    req.file.path = publicUrl;
  }

  const post = await prisma.post.create({
    data: {
      text: sanitizeText(text),
      media: req.file ? [getFileUrl(req.file)] : [],
      user: { connect: { id: req.user.id } },
    },
  });

  /**
   * Create Notification
   * */
  const followers = await prisma.user.findMany({
    where: { following: { some: { id: req.user.id } } },
    select: { id: true },
  });

  if (followers.length > 0) {
    await prisma.notification.createMany({
      data: followers.map(({ id }) => ({
        receiverId: id,
        actorId: req.user.id,
        type: 'post_from_followed',
        postId: post.id,
      })),
    });
  }

  res.status(201).json(post);
};

export const getAllPost: RequestHandler = async (req, res) => {
  const posts = await prisma.post.findMany({
    ...createPostFilter(req.query),
    include: {
      user: true,
      _count: { select: { likedBy: true, comment: true } },
      likedBy: { where: { id: req.user.id } },
    },
  });

  let result = [];
  for (const p of posts) {
    p.user = cleanUser(p.user) as User;
    result.push(appendIsLiked(p));
  }

  res.json(result);
};

export const getSinglePost: RequestHandler = async (req, res) => {
  const postId = req.post.id;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: true,
      _count: { select: { likedBy: true, comment: true } },
      likedBy: { where: { id: req.user.id } },
    },
  });

  if (post) post.user = cleanUser(post?.user) as User;
  res.json(appendIsLiked(post));
};

export const getPostByUser: RequestHandler = async (req, res) => {
  const userId = req.params['userId'];

  const posts = await prisma.post.findMany({
    ...createPostFilter(req.query),
    where: { userId },
    include: {
      _count: { select: { likedBy: true, comment: true } },
      likedBy: { where: { id: req.user.id } },
      user: true,
    },
  });

  const result = posts.map(el => ({
    ...appendIsLiked(el),
    user: cleanUser(el.user),
  }));

  res.json(result);
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
      likedBy: { where: { id: req.user.id } },
    },
  });

  res.json(appendIsLiked(updatedPost));
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
  const isLike = req.method === 'POST';

  await prisma.post.update({
    where: { id: post.id },
    data: {
      likedBy: { [isLike ? 'connect' : 'disconnect']: { id: userId } },
    },
  });

  /**
   * Create notification
   */
  if (isLike) {
    await prisma.notification.create({
      data: {
        receiverId: post.userId,
        type: 'post_liked',
        actorId: req.user.id,
        postId: post.id,
      },
    });
  }

  res.status(204).end();
};

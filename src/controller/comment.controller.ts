import type { RequestHandler } from 'express';

import { prisma } from '@/lib/prismaClient';
import { cleanManyUser, cleanUser } from '@/lib/user';
import type { User } from '@prisma/client';
import { appendIsLiked, sanitizeText } from '@/lib/post';
import { createCommentFilter } from '@/lib/comment';

export const createComment: RequestHandler = async (req, res) => {
  const { post, user } = req;
  const { text } = req.body;

  const newComment = await prisma.comment.create({
    data: {
      text: sanitizeText(text),
      userId: user.id,
      postId: post.id,
    },
    include: { user: true },
  });

  /**
   * Create notification
   */
  await prisma.notification.create({
    data: {
      receiverId: post.userId,
      actorId: user.id,
      type: 'post_commented',
      commentId: newComment.id,
    },
  });

  res.status(201).json({ ...newComment, user: cleanUser(newComment.user) });
};

export const getCommentByPost: RequestHandler = async (req, res) => {
  const { post } = req;

  const comments = await prisma.comment.findMany({
    ...createCommentFilter(req.query),
    where: { postId: post.id },
    include: {
      _count: { select: { likedBy: true } },
      user: true,
      likedBy: { where: { id: req.user.id } },
    },
  });

  const cleanedComment = [];
  for (const c of comments) {
    c.user = cleanUser(c.user) as User;
    cleanedComment.push(appendIsLiked(c));
  }

  res.json(cleanedComment);
};

export const updateComment: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { text } = req.body;
  const { comment } = req;

  if (comment.userId !== userId) {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  const updated = await prisma.comment.update({
    where: { id: comment.id },
    data: { text: sanitizeText(text) },
  });

  res.json(updated);
};

export const deleteComment: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { comment } = req;

  if (comment.userId !== userId) {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  await prisma.comment.delete({ where: { id: comment.id } });
  res.status(204).end();
};

export const likeComment: RequestHandler = async (req, res) => {
  const commentId = req.comment.id;
  const userId = req.user.id;
  const isLike = req.method === 'POST';

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      likedBy: {
        [isLike ? 'connect' : 'disconnect']: { id: userId },
      },
    },
  });

  /**
   * Create notif
   */
  if (isLike) {
    await prisma.notification.create({
      data: {
        type: 'comment_liked',
        postId: req.post.id,
        receiverId: req.comment.userId,
        actorId: req.user.id,
      },
    });
  }

  res.status(204).end();
};

export const getLikedBy: RequestHandler = async (req, res) => {
  const commentId = req.comment.id;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { likedBy: true },
  });

  res.json(comment?.likedBy ? cleanManyUser(comment.likedBy) : []);
};

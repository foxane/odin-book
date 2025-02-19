import { Prisma, type User } from '@prisma/client';
import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prismaClient';
import { getFileUrl, signJwt } from '@/lib/utils';
import * as userUtils from '@/lib/user';
import { uploadToBucket } from '@/middleware/bucket';

/**
 * ====================== User controller ============================
 */

export const createUser: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  const hash = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { name, email, password: hash },
  });

  res.status(200).json({
    token: signJwt(newUser),
    user: userUtils.cleanUser(newUser, { owner: true }),
  });
};

export const getAllUser: RequestHandler = async (req, res) => {
  const users = await prisma.user.findMany({
    ...userUtils.createUserFilter(req.query),

    include: {
      _count: { select: { follower: true, following: true } },
      follower: { where: { id: req.user.id } },
    },
  });

  const cleanedUser = userUtils.cleanManyUser(users);
  const result = cleanedUser.map(el => userUtils.appendIsFollowed(el));

  res.json(result);
};

export const getSingleUser: RequestHandler = async (req, res) => {
  const id = req.params['userId'];
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { follower: true, following: true } },
      follower: { where: { id: req.user.id } },
    },
  });

  if (!user) {
    res.status(404).json({ message: 'User not found!' });
    return;
  }

  res.json(userUtils.appendIsFollowed(userUtils.cleanUser(user)));
};

type UserUpdatePayload = {
  name?: string;
  email?: string;
  password?: string;
  bio?: string;
};

export const updateUser: RequestHandler = async (req, res) => {
  const toUpdateId = req.params['userId'];
  const { id } = req.user as User;

  /**
   * Prevent update guest account or not respective user
   */
  if (toUpdateId !== id || toUpdateId === 'guest') {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  /**
   * Update db record
   */
  const { name, email, password, bio } = req.body as UserUpdatePayload;
  const hashedPw = password ? await bcrypt.hash(password, 10) : undefined;
  const newData: Prisma.UserUpdateInput = {
    ...(name && { name }),
    ...(email && { email }),
    ...(bio && { bio }),
    ...(password && { password: hashedPw }),
  };

  const user = await prisma.user.update({ where: { id }, data: newData });
  res.json({
    token: signJwt(user),
    user: userUtils.cleanUser(user, { owner: true }),
  });
};

export const updateImage: RequestHandler = async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'No image!' });
    return;
  }

  if (req.user.id !== req.params['userId']) {
    res.status(403).json({ message: 'Unauthorized' });
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    const publicUrl = await uploadToBucket(req.file, req.user.id);
    req.file.path = publicUrl;
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { [req.file.fieldname]: getFileUrl(req.file) },
  });

  res.json({
    token: signJwt(user),
    user: userUtils.cleanUser(user, { owner: true }),
  });
};

/**
 * ====================== Follow controller ============================
 */

export const followUser: RequestHandler = async (req, res) => {
  const idToFollow = req.params['userId'];

  if (idToFollow === req.user.id) {
    res.status(400).json({ message: 'You cannot follow yourself' });
    return;
  }

  /**
   * Update user being followed
   */
  await prisma.user.update({
    where: { id: idToFollow },
    data: { follower: { connect: { id: req.user.id } } },
  });

  /**
   * Notification
   */
  await prisma.notification.create({
    data: {
      receiverId: idToFollow,
      type: 'follower',
      actor: { connect: { id: req.user.id } },
    },
  });

  res.status(204).end();
};

export const unfollowUser: RequestHandler = async (req, res) => {
  const idToUnfollow = req.params['userId'];

  if (idToUnfollow === req.user.id) {
    res.status(400).json({ message: 'You cannot unfollow yourself' });
    return;
  }

  await prisma.user.update({
    where: { id: idToUnfollow },
    data: { follower: { disconnect: { id: req.user.id } } },
  });

  res.status(204).end();
};

export const getFollowers: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const followers = await prisma.user.findMany({
    ...userUtils.createUserFilter(req.query),
    where: { following: { some: { id: userId } } },
    select: {
      id: true,
      name: true,
      avatar: true,
      follower: {
        where: { id: req.user.id }, // Check if the requesting user follows them
        select: { id: true },
      },
    },
  });

  const result = followers.map(el => userUtils.appendIsFollowed(el));
  res.json(result);
};

export const getFollowing: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const followers = await prisma.user.findMany({
    ...userUtils.createUserFilter(req.query),
    where: { follower: { some: { id: userId } } },
    select: {
      id: true,
      name: true,
      avatar: true,
      follower: {
        where: { id: req.user.id }, // Check if the requesting user follows them
        select: { id: true },
      },
    },
  });

  const result = followers.map(el => userUtils.appendIsFollowed(el));
  res.json(result);
};

import type { Prisma, User } from '@prisma/client';
import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prismaClient';
import {
  cleanManyUser,
  cleanUser,
  createUserFilter,
  getFileUrl,
  signJwt,
} from '@/lib/utils';

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
    user: cleanUser(newUser, { owner: true }),
  });
};

export const getAllUser: RequestHandler = async (req, res) => {
  const { name, take, page } = req.query;

  const users = await prisma.user.findMany(
    createUserFilter({ name, take, page }),
  );
  res.json(cleanManyUser(users));
};

export const getSingleUser: RequestHandler = async (req, res) => {
  const id = req.params['userId'];
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    res.status(404).json({ message: 'User not found!' });
    return;
  }

  res.json(cleanUser(user));
};

type UserUpdatePayload = {
  name?: string;
  email?: string;
  password?: string;
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
   * Handle avatar and bg update
   */
  const avatar = req.files['avatar'];
  const background = req.files['background'];

  const { name, email, password } = req.body as UserUpdatePayload;
  const hashedPw = password ? await bcrypt.hash(password, 10) : undefined;
  const newData: Prisma.UserUpdateInput = {
    ...(name && { name }),
    ...(email && { email }),
    ...(password && { password: hashedPw }),
    ...(avatar && { avatar: getFileUrl(avatar[0]) }),
    ...(background && { background: getFileUrl(background[0]) }),
  };

  /**
   * Check if no field is provided
   */
  if (Object.keys(newData).length === 0 && !req.files) {
    res.status(400).json({
      message: 'No valid fields provided for update',
    });
    return;
  }

  const user = await prisma.user.update({ where: { id }, data: newData });
  res.json({ token: signJwt(user), user: cleanUser(user, { owner: true }) });
};

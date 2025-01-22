import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prismaClient';
import {
  cleanManyUser,
  cleanUser,
  createUserFilter,
  signJwt,
} from '@/lib/utils';

export const createUser: RequestHandler = async (req, res, next) => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  try {
    const hash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hash },
    });

    res.status(200).json({ token: signJwt(newUser), user: cleanUser(newUser) });
  } catch (error) {
    next(error);
  }
};

export const getAllUser: RequestHandler = async (req, res, next) => {
  const { name, take, page } = req.query;

  try {
    const users = await prisma.user.findMany(
      createUserFilter({ name, take, page }),
    );
    res.json(cleanManyUser(users));
  } catch (error) {
    next(error);
  }
};

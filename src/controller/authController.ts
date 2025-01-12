import { prisma } from '@/lib/prisma';
import type { RequestHandler } from 'express';
import { hash } from 'bcryptjs';
import { signJwt } from '@/lib/jwt';

export const signupController: RequestHandler = async (req, res, next) => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  try {
    const hashedPw = await hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPw },
    });

    res.status(201).json({
      message: 'User created',
      token: signJwt(newUser),
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

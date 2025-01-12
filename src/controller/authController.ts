import { prisma } from '@/lib/prisma';
import type { RequestHandler } from 'express';
import { compare, hash } from 'bcryptjs';
import { signJwt } from '@/lib/jwt';
import { cleanUser } from '@/lib/utils';

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
      user: cleanUser(newUser),
    });
  } catch (error) {
    next(error);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const match = await compare(password, user.password ?? '');
    if (!match) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    res.json({
      message: 'Login successful',
      token: signJwt(user),
      user: cleanUser(user),
    });
  } catch (error) {
    next(error);
  }
};

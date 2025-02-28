import type { User } from '@prisma/client';
import type { RequestHandler } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import { signJwt } from '@/lib/utils';
import { cleanUser } from '@/lib/user';
import { prisma } from '@/lib/prismaClient';

export const login: RequestHandler = (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    (err: unknown, user: User, info: { message: string }) => {
      if (err) {
        next(err);
        return;
      }

      if (!user) {
        res.status(401).json({ message: info.message });
        return;
      }

      res.json({
        token: signJwt(user),
        user: cleanUser(user, { owner: true }),
      });
    },
  )(req, res, next);
};

/**
 * Array of handler, first one will determine which provider to authenticate
 * the second will send token and user data
 */
export const OAuthCallback: RequestHandler[] = [
  (req, res, next) => {
    const provider = req.query['provider'] as string;
    const allowed = ['github', 'google'];

    if (!allowed.includes(provider)) {
      res.status(400).json({ message: 'Invalid OAuth provider' });
      return;
    }

    passport.authenticate(provider, { session: false })(req, res, next);
  },

  /**
   * Create temp token to be exchanged later
   */
  (req, res) => {
    const user = req.user as User;
    const token = jwt.sign(
      { id: user.id, temp: true },
      process.env.JWT_SECRET,
      {
        expiresIn: '5m',
      },
    );

    const redirectUrl = `${process.env.FRONTEND_URL}/auth?token=${token}`;
    console.log(redirectUrl);
    res.redirect(redirectUrl);
  },
];

export const getSelf: RequestHandler = (req, res) => {
  res.json(cleanUser(req.user, { owner: true }));
};

export const guestLogin: RequestHandler = async (_req, res) => {
  let guest = await prisma.user.findFirst({
    where: { role: 'GUEST' },
  });

  if (!guest)
    guest = await prisma.user.create({
      data: {
        role: 'GUEST',
        name: 'Guest Account',
        email: 'guestemail@me.com',
      },
    });

  res.json({ user: guest, token: signJwt(guest) });
};

export const exchangeToken: RequestHandler = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: number;
      temp: boolean;
    };
    if (!decoded.temp) {
      res.status(401).json({ error: 'Invalid token type' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(401).json({ error: 'User not found!' });
      return;
    }

    res.json({ token: signJwt(user) });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

import type { User } from '@prisma/client';
import type { RequestHandler } from 'express';
import passport from 'passport';

import { signJwt } from '@/lib/utils';
import { cleanUser } from '@/lib/user';

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

  (req, res) => {
    const user = req.user as User;
    res.json({ token: signJwt(user), user: cleanUser(user, { owner: true }) });
  },
];

export const getSelf: RequestHandler = (req, res) => {
  res.json(cleanUser(req.user, { owner: true }));
};

import type { User } from '@prisma/client';
import type { RequestHandler } from 'express';
import passport from 'passport';

import { cleanUser, signJwt } from '@/lib/utils';

export const login: RequestHandler = (_req, res, next) => {
  passport.authenticate(
    'local',
    (err: unknown, user: User, info: { message: string }) => {
      if (err) {
        next(err);
        return;
      }

      if (!user) {
        res.status(401).json({ message: info.message });
        return;
      }

      res.json({ token: signJwt(user), user: cleanUser(user) });
    },
  );
};

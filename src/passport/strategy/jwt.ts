import {
  Strategy as JWTStrategy,
  ExtractJwt,
  type StrategyOptions,
} from 'passport-jwt';

import { prisma } from '@/lib/prismaClient';

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

export const jwt = new JWTStrategy(opts, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (user) done(null, user);
    else done(null, false);
  } catch (error) {
    done(error);
  }
});

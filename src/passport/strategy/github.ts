import { Strategy, type Profile, type StrategyOptions } from 'passport-github2';
import type { User } from '@prisma/client';

import { prisma } from '@/lib/prismaClient';

type VerifyCallback = (
  token: string,
  refresh: string,
  profile: Profile,
  done: (err: unknown, user?: User) => void,
) => void;

const opts: StrategyOptions = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_CALLBACK_URI + '?provider=github',
};

const verify: VerifyCallback = async (_t, _r, profile, done) => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { provider: { id: profile.id } },
    });

    if (existingUser) return done(null, existingUser);

    const newUser = await prisma.user.create({
      data: {
        name: profile.displayName ?? profile.username,
        email: profile.emails ? profile.emails[0].value : profile.id,
        avatar: profile.photos ? profile.photos[0].value : null,
        provider: { create: { id: profile.id, provider: 'github' } },
      },
    });

    done(null, newUser);
  } catch (error) {
    done(error);
  }
};

export const github = new Strategy(opts, verify);

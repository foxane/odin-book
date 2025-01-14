import type { GoogleStrategyCallback } from '@/@types/auth';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  Strategy as Google,
  type StrategyOptions,
} from 'passport-google-oauth20';

const options: StrategyOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_CALLBACK_URI + '?provider=google',
};

const verify: GoogleStrategyCallback = async (_a, _r, profile, done) => {
  const existingUser = await prisma.user.findFirst({
    where: { provider: { id: profile.id, name: 'google' } },
  });
  if (existingUser) {
    done(null, existingUser);
    return;
  }

  const data: Prisma.UserCreateInput = {
    name: profile.displayName,
    avatar: profile.photos ? profile.photos[0].value : profile._json.picture,
    email: profile.emails ? profile.emails[0].value : null,
    provider: { create: { id: profile.id, name: 'google' } },
  };

  const newUser = await prisma.user.create({ data });
  done(null, newUser);
};

export const google = new Google(options, verify);

import type { GithubStrategyCallback } from '@/@types/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Strategy as Github, type StrategyOptions } from 'passport-github2';

const options: StrategyOptions = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.OAUTH_CALLBACK_URI + '?provider=github',
};

const verify: GithubStrategyCallback = async (_a, _r, profile, done) => {
  const existingUser = await prisma.user.findFirst({
    where: { provider: { name: 'github', id: profile.id } },
  });
  if (existingUser) {
    done(null, existingUser);
    return;
  }

  const data: Prisma.UserCreateInput = {
    name: profile.displayName ?? profile.username,
    avatar: profile.photos[0].value,
    email:
      profile.email ??
      `${profile.id}+${profile.username}@users.noreply.github.com`,
    provider: { create: { id: profile.id, name: 'github' } },
  };

  const newUser = await prisma.user.create({ data });
  done(null, newUser);
};

export const github = new Github(options, verify);

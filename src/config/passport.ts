import { prisma } from '@/lib/prisma';
import { type User, Prisma } from '@prisma/client';
import passport from 'passport';
import { Strategy as Github, type StrategyOptions } from 'passport-github2';

type Verify = (
  _access: string,
  _refresh: string | null,
  profile: {
    id: string;
    displayName?: string;
    username: string;
    email?: string;
    photos: { value: string }[];
  },
  done: (err: unknown, user: User, info?: unknown) => void,
) => void;

const options: StrategyOptions = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
};

const verify: Verify = async (_access, _refresh, profile, done) => {
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
  return;
};

export default function initGithub() {
  passport.use(new Github(options, verify));
}

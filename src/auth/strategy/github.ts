import { Strategy, type Profile, type StrategyOptions } from 'passport-github2';
import type { User } from '@prisma/client';

import { prisma } from '@/lib/prismaClient';
import { sendToBucket } from '@/middleware/bucket';
import axios from 'axios';

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
        provider: { create: { id: profile.id, provider: 'github' } },
      },
    });

    if (profile.photos) {
      const originUrl = profile.photos[0].value;

      const { data, headers } = await axios.get<ArrayBuffer>(originUrl, {
        responseType: 'arraybuffer',
      });
      const mimeType = headers['Content-Type'] as string;

      const avatarUrl = await sendToBucket(
        'avatar',
        `${newUser.id}/${Date.now()}`,
        data,
        mimeType,
      );

      const user = await prisma.user.update({
        where: { id: newUser.id },
        data: { avatar: avatarUrl },
      });

      return done(null, user);
    }

    done(null, newUser);
  } catch (error) {
    done(error);
  }
};

export const github = new Strategy(opts, verify);

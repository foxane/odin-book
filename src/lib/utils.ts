import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';

export const checkEnv = () => {
  let abort = false;
  const needed = [
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'DATABASE_URL',

    // 'OAUTH_CALLBACK_URI',

    // 'GITHUB_CLIENT_ID',
    // 'GITHUB_CLIENT_SECRET',

    // 'GOOGLE_CLIENT_ID',
    // 'GOOGLE_CLIENT_SECRET',
  ];

  for (const e of needed) {
    if (!process.env[e]) {
      console.error(`${e} is not set!`);
      abort = true;
    }
  }

  if (abort) {
    console.error('Missing environment variable above, exited');
    process.exit(1);
  }
};

export const signJwt = (user: User) => {
  const opts: jwt.SignOptions = {
    expiresIn: '7 days',
    algorithm: 'HS256',
  };
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, opts);
};

/**
 * Clean user object from sensitive data
 * @param user Prisma User object
 * @returns User object without sensitive data
 */
export const cleanUser = (user: User) => {
  const { password, ...cleanedUser } = user;
  return cleanedUser;
};

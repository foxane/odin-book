import jwt from 'jsonwebtoken';
import type { Comment, NotifType, Post, Prisma, User } from '@prisma/client';
import { networkInterfaces } from 'node:os';
import { prisma } from './prismaClient';

export const checkEnv = () => {
  let abort = false;
  const needed = [
    'PORT',
    'NODE_ENV',

    'JWT_SECRET',
    'DATABASE_URL',

    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',

    'OAUTH_CALLBACK_URI',

    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',

    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
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
checkEnv();

export const signJwt = (user: User) => {
  const opts: jwt.SignOptions = {
    expiresIn: '7 days',
    algorithm: 'HS256',
  };
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, opts);
};

export const getLocalIp = () => {
  const nets = networkInterfaces();

  for (const name in nets) {
    const iFaces = nets[name];

    if (!iFaces) return 'localhost';

    for (const iFace of iFaces) {
      if (iFace.family === 'IPv4' && !iFace.internal) return iFace.address;
    }
  }

  return 'localhost'; // Fallback
};

export const getFileUrl = (file: Express.Multer.File) => {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT ?? 3000;

  if (isProd) return file.path;

  return `http://${getLocalIp()}:${PORT}/${file.filename}`;
};

export const createCursor = <T>(cursor?: string | number, take?: string): T => {
  if (!cursor) return {} as T;

  return {
    ...(cursor ? { cursor: { id: cursor } } : {}),
    ...(cursor ? { skip: 1 } : {}),
    ...(take ? { take: parseInt(take) } : {}),
  } as T;
};

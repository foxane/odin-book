import type { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import os from 'os';

export const signJwt = (payload: User): string => {
  return jwt.sign({ id: payload.id }, Bun.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
};

export const verifyJwt = async (token: string): Promise<User | null> => {
  const { id } = jwt.verify(token, Bun.env.JWT_SECRET) as { id: string };
  return prisma.user.findUnique({ where: { id } });
};

export const cleanUser = (user: User) => {
  const { password, ...cleanedUser } = user;
  return cleanedUser;
};

export const getLocalNetworkIP = () => {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {
    const interfaceInfo = networkInterfaces[interfaceName];

    if (!interfaceInfo) {
      return 'localhost';
    }

    for (const iface of interfaceInfo) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // Fallback
};

export const verifyEnvironmentVariables = () => {
  let abort = false;

  const optional = ['PORT'];
  const needed = [
    'DATABASE_URL',
    'JWT_SECRET',

    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',

    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',

    'OAUTH_CALLBACK_URI',
  ];

  for (const e of optional) {
    if (!Bun.env[e]) {
      console.warn(`Warning: ${e} env var is not set, but it is optional`);
    }
  }

  for (const e of needed) {
    if (!Bun.env[e]) {
      console.error(`Error: ${e} env var is not set`);
      abort = true;
    }
  }

  if (abort) process.exit(1);
};

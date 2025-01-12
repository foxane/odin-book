import type { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import os from 'os';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET is not defined');

export const signJwt = (payload: User): string => {
  return jwt.sign({ id: payload.id }, SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
};

export const verifyJwt = async (token: string): Promise<User | null> => {
  const { id } = jwt.verify(token, SECRET) as { id: string };
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

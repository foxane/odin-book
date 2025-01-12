import { verifyJwt } from '@/lib/utils';
import type { RequestHandler } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export const authenticate: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token not provided' });
    return;
  }

  try {
    const user = await verifyJwt(token);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ message: 'Token has expired' });
    } else if (error instanceof JsonWebTokenError) {
      res.status(403).json({ message: 'Invalid token' });
    } else {
      next(error);
    }
  }
};

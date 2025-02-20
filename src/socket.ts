import { Server, Socket, type ExtendedError } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prismaClient';
import express from 'express';

const SECRET = process.env.JWT_SECRET;
const app = express();
const server = createServer(app);

const auth = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  const token = socket.handshake.auth['token'];
  if (!token) next(new Error('Authentication error: token not provided'));

  try {
    const { id } = jwt.verify(token, SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) next(new Error('Authentication error: user not found'));

    socket.data.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new Error('Authentication error: token has expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new Error('Authentication error: token malformed'));
    } else {
      next(new Error('Authentication error: '));
    }
  }
};

const io = new Server(server, {
  cors: { origin: '*' },
});

io.use(auth);

export { app, server };

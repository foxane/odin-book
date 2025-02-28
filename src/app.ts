import express from 'express';
import cors from 'cors';

import { errorMiddleware } from '@/middleware/error';
import { morganMiddleware } from '@/middleware/logger';
import authRouter from '@/routes/auth.routes';
import userRouter from '@/routes/user.routes';
import postRouter from '@/routes/post.routes';
import commentRouter from '@/routes/comment.routes';
import { verifyPostExist } from './middleware/authenticate';
import notifRouter from './routes/notif.routes';

import { initializePassport } from './auth/passportInit';
import { getLocalIp } from './lib/utils';
import chatRouter from './routes/chat.routes';
import { createServer } from 'node:http';
import { initializeSocket } from './socket';

const app = express();
const server = createServer(app);

app.use((_req, _res, next) => {
  setTimeout(() => {
    next();
  }, 1000);
});

initializePassport();
initializeSocket(server);

app.use(cors());
app.use(express.json());
app.use(morganMiddleware);
app.use(express.static('upload'));
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/user{s}', userRouter);
app.use('/post{s}/:postId/comment{s}', verifyPostExist, commentRouter);
app.use('/post{s}', postRouter);
app.use('/notification{S}', notifRouter);
app.use('/chat{s}', chatRouter);

app.use(errorMiddleware);

const ENV = process.env.NODE_ENV;
const PORT = process.env.PORT ?? 3000;
const LOCAL_IP = getLocalIp();

server.listen(PORT, () => {
  console.log(`
    ==========================================
    🚀 Server started
    ==========================================
    🌐 Local:    http://localhost:${PORT.toString()}
    🌐 Network:  http://${LOCAL_IP}:${PORT.toString()}
    ==========================================
    🛠️  Environment: ${ENV}
    ==========================================
    `);
});

import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';

import setupSocketServer from '@/socket';
import { checkEnv } from '@/lib/utils';
import { initializePassport } from '@/passport/passport';
import { errorMiddleware } from '@/middleware/error';
import { morganMiddleware } from '@/middleware/logger';
import authRouter from '@/routes/auth.routes';
import userRouter from '@/routes/user.routes';
import postRouter from '@/routes/post.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morganMiddleware);
app.use(express.static('upload'));
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/user{s}', userRouter);
app.use('/post{s}', postRouter);

app.use(errorMiddleware);

initializePassport();
checkEnv();

const port = process.env.PORT ?? 3000;
const server = createServer(app);
setupSocketServer(server);

server.listen(port, () => {
  console.log('Server listening on port: ', port);
});

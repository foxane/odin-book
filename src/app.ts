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

const app = express();

app.use((req, res, next) => {
  setTimeout(() => {
    next();
  }, 1000);
});
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

app.use(errorMiddleware);

export default app;

import express from 'express';
import cors from 'cors';
import authRouter from '@/routes/authRouter';
import userRouter from './routes/userRouter';
import { initializePassport } from './passport/initialize';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/user', userRouter);

initializePassport();

export default app;

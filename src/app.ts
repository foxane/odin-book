import express from 'express';
import cors from 'cors';
import authRouter from '@/routes/authRouter';
import initGithub from './config/passport';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);
initGithub();

export default app;

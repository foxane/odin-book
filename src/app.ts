import express from 'express';
import cors from 'cors';
import authRouter from '@/routes/authRouter';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

export default app;

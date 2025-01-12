import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import setupSocketServer from './socket';
import authRouter from '@/routes/authRouter';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

const server = createServer(app);
setupSocketServer(server);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('Server listening on port', port);
});

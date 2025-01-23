import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';

import routes from '@/routes';
import setupSocketServer from '@/socket';
import { checkEnv } from '@/lib/utils';
import { initializePassport } from '@/passport/passport';
import { errorMiddleware } from '@/middleware/error';
import { morganMiddleware } from '@/middleware/logger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morganMiddleware);
app.use(express.static('upload'));

app.use(routes);

app.use(errorMiddleware);

initializePassport();
checkEnv();

const port = process.env.PORT ?? 3000;
const server = createServer(app);
setupSocketServer(server);

server.listen(port, () => {
  console.log('Server listening on port: ', port);
});

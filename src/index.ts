import { createServer } from 'http';
import express from 'express';
import setupSocketServer from './socket';

const app = express();

app.get('/', (_req, res) => {
  res.send('Http work!');
});

const server = createServer(app);
setupSocketServer(server);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('Server listening on port', port);
});

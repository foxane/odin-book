import { createServer } from 'http';
import setupSocketServer from '@/socket';
import app from '@/app';
import { getLocalNetworkIP } from '@/lib/utils';

const server = createServer(app);
setupSocketServer(server);

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV ?? 'development';

server.listen(PORT, () => {
  console.log(`
  ==========================================
  🚀 Server started
  ==========================================
  🌐 Local:    http://localhost:${PORT.toString()}
  🌐 Network:  http://${getLocalNetworkIP()}:${PORT.toString()}
  ==========================================
  🛠️  Environment: ${ENV}
  ==========================================
  `);
});

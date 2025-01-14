import { createServer } from 'http';
import setupSocketServer from '@/socket';
import app from '@/app';
import { getLocalNetworkIP, verifyEnvironmentVariables } from '@/lib/utils';

// Setup and verify env var
verifyEnvironmentVariables();
const PORT = process.env.PORT ?? 3000;
const ENV = process.env.NODE_ENV ?? 'development';

// Create http and socket instance
const server = createServer(app);
setupSocketServer(server);

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

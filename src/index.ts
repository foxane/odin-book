import { createServer } from 'node:http';

import app from './app';
import setupSocketServer from './socket';
import { initializePassport } from './auth/passportInit';
import { checkEnv, getLocalIp } from './lib/utils';

const server = createServer(app);
checkEnv();
setupSocketServer(server);
initializePassport();

const ENV = process.env.NODE_ENV;
const PORT = process.env.PORT ?? 3000;
const LOCAL_IP = getLocalIp();

server.listen(PORT, () => {
  console.log(`
    ==========================================
    🚀 Server started
    ==========================================
    🌐 Local:    http://localhost:${PORT.toString()}
    🌐 Network:  http://${LOCAL_IP}:${PORT.toString()}
    ==========================================
    🛠️  Environment: ${ENV}
    ==========================================
    `);
});

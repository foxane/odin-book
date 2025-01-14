import { prisma } from '@/lib/prisma';

const { DATABASE_URL, JWT_SECRET, NODE_ENV } = process.env;

console.log(`
    ==========================================
    🧪 Test starting..
    ==========================================
    🌐 Database: ${DATABASE_URL}
    🔒 JWT Secret: ${JWT_SECRET}
    🛠️ Environment: ${NODE_ENV ?? 'Undefined'}
    ==========================================
`);

if (NODE_ENV !== 'test') {
  console.error('🚨 Wrong environtment!');
  process.exit(1);
}

// Cleanup database
try {
  await prisma.user.deleteMany();
} catch (error) {
  console.log(error);
  process.exit(1);
}

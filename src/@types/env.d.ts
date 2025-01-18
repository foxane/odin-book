import type { User } from '@prisma/client';

declare module 'bun' {
  interface Env {
    readonly PORT?: number;
    readonly DATABASE_URL: string;
    readonly JWT_SECRET: string;

    readonly OAUTH_CALLBACK_URI: string;

    readonly GITHUB_CLIENT_ID: string;
    readonly GITHUB_CLIENT_SECRET: string;

    readonly GOOGLE_CLIENT_ID: string;
    readonly GOOGLE_CLIENT_SECRET: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

import type { User } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    user: User;
    files: { [fieldname: string]: Express.Multer.File[] };
  }
}

import type { Post, User } from '@prisma/client';

interface ValidatedPost extends Post {
  user: User;
  _count: {
    likedBy: number;
  };
}

declare module 'express-serve-static-core' {
  interface Request {
    post: ValidatedPost;
    user: User;
    files: { [fieldname: string]: Express.Multer.File[] };
  }
}

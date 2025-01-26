import type { Comment, Post, User } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    post: Post;
    comment: Comment;
    user: User;
    files: { [fieldname: string]: Express.Multer.File[] };
  }
}

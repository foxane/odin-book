import { Router } from 'express';

import * as comment from '@/controller/comment.controller';
import { authenticate, verifyCommentExist } from '@/middleware/authenticate';
import { newPost } from '@/middleware/validation';

const commentRouter = Router();

/**
 *  Defining verifyPostExist on commentRouter.param() dont work like postRouter.param()
 *  So it will defined in app.ts
 */

commentRouter.use(authenticate);
commentRouter.param('commentId', verifyCommentExist);

commentRouter
  .route('/:commentId/like')
  .get(comment.getLikedBy)
  .post(comment.likeComment)
  .delete(comment.likeComment);

commentRouter
  .route('/:commentId')
  .put(newPost, comment.updateComment)
  .delete(comment.deleteComment);

commentRouter
  .route('/')
  .get(comment.getCommentByPost)
  .post(newPost, comment.createComment);

export default commentRouter;

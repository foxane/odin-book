import { Router } from 'express';

import * as post from '@/controller/post.controller';
import { authenticate, verifyPostExist } from '@/middleware/authenticate';
import { newPost } from '@/middleware/validation';
import { upload } from '@/middleware/multer';

const postRouter = Router();

postRouter.use(authenticate);
postRouter.param('postId', verifyPostExist);

postRouter
  .route('/:postId/like')
  .get(post.getLikedBy)
  .post(post.likePost)
  .delete(post.likePost);

postRouter
  .route('/:postId')
  .get(post.getSinglePost)
  .put(newPost, post.updatePost)
  .delete(post.deletePost);

postRouter
  .route('/')
  .get(post.getAllPost)
  .post(upload.single('user-upload'), newPost, post.createPost);

export default postRouter;

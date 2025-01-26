import { Router } from 'express';

import * as post from '@/controller/post.controller';
import { authenticate, verifyPostExist } from '@/middleware/authenticate';
import { newPost } from '@/middleware/validation';

const postRouter = Router();

postRouter.use(authenticate, verifyPostExist);

postRouter
  .route('/:postId/like')
  .get(post.getLikedBy)
  .post(post.likePost)
  .delete(post.unlikePost);

postRouter
  .route('/:postId')
  .get(post.getSinglePost)
  .put(newPost, post.updatePost)
  .delete(post.deletePost);

postRouter.route('/').get(post.getAllPost).post(newPost, post.createPost);

export default postRouter;

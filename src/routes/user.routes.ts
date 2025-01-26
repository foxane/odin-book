import { Router } from 'express';

import { authenticate } from '@/middleware/authenticate';
import * as user from '@/controller/user.controller';
import { upload } from '@/middleware/multer';
import { userUpdate } from '@/middleware/validation';
import { getPostByUser } from '@/controller/post.controller';

const userRouter = Router();

userRouter.use(authenticate);

userRouter.route('/:userId/post{s}').get(getPostByUser);
userRouter.route('/:userId/follower{s}').get(user.getFollowers);
userRouter.route('/:userId/following').get(user.getFollowing);

userRouter
  .route('/:userId/avatar')
  .patch(upload.single('avatar'), user.updateImage);

userRouter
  .route('/:userId/background')
  .patch(upload.single('background'), user.updateImage);

userRouter
  .route('/:userId/follow')
  .post(user.followUser)
  .delete(user.unfollowUser);

userRouter
  .route('/:userId')
  .get(user.getSingleUser)
  .put(userUpdate, user.updateUser);

userRouter.route('/').get(user.getAllUser);

export default userRouter;

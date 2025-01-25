import { Router } from 'express';

import { authenticate } from '@/middleware/authenticate';
import * as user from '@/controller/user.controller';
import { upload } from '@/middleware/multer';
import { userUpdate } from '@/middleware/validation';

const userRouter = Router();

userRouter.route('/:userId/follower{s}').get(authenticate, user.getFollowers);
userRouter.route('/:userId/following').get(authenticate, user.getFollowing);

userRouter
  .route('/:userId/avatar')
  .patch(authenticate, upload.single('avatar'), user.updateImage);

userRouter
  .route('/:userId/background')
  .patch(authenticate, upload.single('background'), user.updateImage);

userRouter
  .route('/:userId/follow')
  .post(authenticate, user.followUser)
  .delete(authenticate, user.unfollowUser);

userRouter
  .route('/:userId')
  .get(authenticate, user.getSingleUser)
  .put(authenticate, userUpdate, user.updateUser);

userRouter.route('/').get(authenticate, user.getAllUser);

export default userRouter;

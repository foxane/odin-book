import {
  getAllUser,
  getSingleUser,
  updateUser,
} from '@/controller/userController';
import { authenticate } from '@/middlewares/authenticate';
import { userUpdateValidator } from '@/middlewares/validator';
import { Router } from 'express';

const userRouter = Router();

userRouter
  .route('/:id')
  .get(authenticate, getSingleUser)
  .put(authenticate, userUpdateValidator, updateUser);
userRouter.get('/', authenticate, getAllUser);

export default userRouter;

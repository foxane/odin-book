import { signupController } from '@/controller/authController';
import { signupValidator } from '@/middlewares/validator';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/signup', signupValidator, signupController);

export default authRouter;

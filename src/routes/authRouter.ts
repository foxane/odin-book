import { loginController, signupController } from '@/controller/authController';
import { loginValidator, signupValidator } from '@/middlewares/validator';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/signup', signupValidator, signupController);
authRouter.post('/login', loginValidator, loginController);

export default authRouter;

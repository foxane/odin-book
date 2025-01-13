import { loginController, signupController } from '@/controller/authController';
import { loginValidator, signupValidator } from '@/middlewares/validator';
import passport from 'passport';
import { Router, type RequestHandler } from 'express';

const authRouter = Router();

authRouter.post('/signup', signupValidator, signupController);
authRouter.post('/login', loginValidator, loginController);
authRouter.get(
  '/github',
  passport.authenticate('github', { scope: ['read:user'] }) as RequestHandler,
);
authRouter.get(
  '/github/callback',
  passport.authenticate('github', { session: false }) as RequestHandler,
  (req, res) => {
    res.json(req.user);
  },
);

export default authRouter;

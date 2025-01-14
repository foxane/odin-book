import {
  loginController,
  oAuthCallback,
  signupController,
} from '@/controller/authController';
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
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  }) as RequestHandler,
);

/**
 * Handle OAuth callback
 */
authRouter.get(
  '/callback',
  (req, res, next) => {
    const provider = req.query['provider'] as string;

    // Add more oauth later
    if (provider !== 'github' && provider !== 'google') {
      res.status(400).send('Invalid OAuth provider, set the query parameter!');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    passport.authenticate(provider, { session: false })(req, res, next);
  },
  oAuthCallback,
);

export default authRouter;

import { Router } from 'express';
import passport from 'passport';

import * as validate from '@/middleware/validation';
import { createUser } from '@/controller/user.controller';
import {
  exchangeToken,
  getSelf,
  guestLogin,
  login,
  OAuthCallback,
} from '@/controller/auth.controller';
import { authenticate } from '@/middleware/authenticate';

const authRouter = Router();

authRouter.get('/guest', guestLogin);
authRouter.get('/me', authenticate, getSelf);
authRouter.post('/exchange-token', exchangeToken);
authRouter.post('/register', validate.signup, createUser);
authRouter.post('/login', login);
/**
 * Handle all callback and send jwt
 */
authRouter.get('/callback', OAuthCallback);

authRouter.get(
  '/github',
  passport.authenticate('github', { scope: ['read:user'] }),
);

authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);

export default authRouter;

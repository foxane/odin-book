import { Router } from 'express';

import * as validate from '@/middleware/validation';
import { createUser } from '@/controller/user.controller';
import { login, OAuthCallback } from '@/controller/auth.controller';
import passport from 'passport';

const authRouter = Router();

authRouter.post('/register', validate.signup, createUser);
authRouter.post('/login', login);
authRouter.get('/callback', OAuthCallback); // Handle all OAuth callback regardless provider

authRouter.get(
  '/github',
  passport.authenticate('github', { scope: ['read:user'] }),
);

authRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);

export default authRouter;

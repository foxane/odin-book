import { Router } from 'express';
import passport from 'passport';

import * as validate from '@/middleware/validation';
import { createUser } from '@/controller/user.controller';
import { login, OAuthCallback } from '@/controller/auth.controller';

const routes = Router();

routes.post('/auth/register', validate.signup, createUser);

routes.post('/auth/login', login);

routes.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['read:user'] }),
);

/**
 * Handle all OAuth callback regardless provider
 */
routes.get('/auth/callback', OAuthCallback);

export default routes;

import { Router } from 'express';
import passport from 'passport';

import * as validate from '@/middleware/validation';
import { createUser, getAllUser } from '@/controller/user.controller';
import { login, OAuthCallback } from '@/controller/auth.controller';

const routes = Router();

routes.post('/auth/register', validate.signup, createUser);
routes.post('/auth/login', login);
routes.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['read:user'] }),
);
routes.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);

// Handle all OAuth callback regardless provider
routes.get('/auth/callback', OAuthCallback);

// Protect all routes after this
routes.use(passport.authenticate('jwt', { session: false }));
routes.route('/users?').get(getAllUser);

export default routes;

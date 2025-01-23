import { Router } from 'express';
import passport from 'passport';

import * as validate from '@/middleware/validation';
import {
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
} from '@/controller/user.controller';
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

// Users routes
routes.route('/user{s}/:userId').get(getSingleUser).put(updateUser);
routes.route('/user{s}').get(getAllUser);

export default routes;

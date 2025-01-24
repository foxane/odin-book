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
import { upload } from '@/middleware/multer';
import { authenticate } from '@/middleware/authenticate';

const routes = Router();

/**
 * Auth routes
 */
routes.post('/auth/register', validate.signup, createUser);
routes.post('/auth/login', login);
routes.get('/auth/callback', OAuthCallback); // Handle all OAuth callback regardless provider
routes.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['read:user'] }),
);
routes.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }),
);

/**
 * User routes
 */
routes
  .route('/user{s}/:userId')
  .get(authenticate, getSingleUser)
  .put(
    authenticate,
    upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'background', maxCount: 1 },
    ]),
    validate.userUpdate,
    updateUser,
  );
routes.route('/user{s}').get(authenticate, getAllUser);

export default routes;

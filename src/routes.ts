import { Router } from 'express';
import passport from 'passport';

import * as validate from '@/middleware/validation';
import * as user from '@/controller/user.controller';
import { login, OAuthCallback } from '@/controller/auth.controller';
import { upload } from '@/middleware/multer';
import { authenticate } from '@/middleware/authenticate';

const routes = Router();

/**
 * Auth routes
 */
routes.post('/auth/register', validate.signup, user.createUser);
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
  .route('/user{s}/:userId/follower{s}')
  .get(authenticate, user.getFollowers);
routes.route('/user{s}/:userId/following').get(authenticate, user.getFollowing);

routes
  .route('/user{s}/:userId/follow')
  .post(authenticate, user.followUser)
  .delete(authenticate, user.unfollowUser);

routes
  .route('/user{s}/:userId')
  .get(authenticate, user.getSingleUser)
  .put(
    authenticate,
    upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'background', maxCount: 1 },
    ]),
    validate.userUpdate,
    user.updateUser,
  );
routes.route('/user{s}').get(authenticate, user.getAllUser);

export default routes;

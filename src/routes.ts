import { Router } from 'express';
import passport from 'passport';

import * as validate from '@/middleware/validation';
import { createUser } from '@/controller/user.controller';
import { login } from '@/controller/auth.controller';

const routes = Router();
routes.post('/auth/register', validate.signup, createUser);
routes.post(
  '/auth/login',
  passport.authenticate('local', { session: false }),
  login,
);

export default routes;

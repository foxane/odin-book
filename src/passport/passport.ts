import passport from 'passport';

import { local } from './strategy/local';
import { jwt } from './strategy/jwt';
import { github } from './strategy/github';
import { google } from './strategy/google';

export const initializePassport = () => {
  passport.use(local);
  passport.use(jwt);
  passport.use(github);
  passport.use(google);
};

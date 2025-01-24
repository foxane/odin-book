import passport from 'passport';

import { local } from './strategy/local';
import { github } from './strategy/github';
import { google } from './strategy/google';

export const initializePassport = () => {
  passport.use(local);
  passport.use(github);
  passport.use(google);
};

import passport from 'passport';
import { github } from './github';
import { google } from './google';

export const initializePassport = () => {
  passport.use(google);
  passport.use(github);
};

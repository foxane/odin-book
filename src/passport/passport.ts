import passport from '@/passport/passport';

import { local } from './strategy/local';
import { jwt } from './strategy/jwt';

export const initializePassport = () => {
  passport.use(local);
  passport.use(jwt);
};

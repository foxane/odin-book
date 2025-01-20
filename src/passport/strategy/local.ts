import { Strategy as Local, type IStrategyOptions } from 'passport-local';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prismaClient';

const opts: IStrategyOptions = {
  session: false,
  usernameField: 'email',
};

export const local = new Local(opts, async (email, password, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return done(null, false);

    /**
     * User may signed up using OAuth
     */
    if (!user.password)
      throw Error('Credentials login is not available for this account');

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) done(null, user);
    else done(null, false);
  } catch (error) {
    done(error);
  }
});

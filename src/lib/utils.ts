import jwt from 'jsonwebtoken';
import type { Prisma, User } from '@prisma/client';

export const checkEnv = () => {
  let abort = false;
  const needed = [
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'DATABASE_URL',

    'OAUTH_CALLBACK_URI',

    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',

    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];

  for (const e of needed) {
    if (!process.env[e]) {
      console.error(`${e} is not set!`);
      abort = true;
    }
  }

  if (abort) {
    console.error('Missing environment variable above, exited');
    process.exit(1);
  }
};

export const signJwt = (user: User) => {
  const opts: jwt.SignOptions = {
    expiresIn: '7 days',
    algorithm: 'HS256',
  };
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, opts);
};

/**
 * Clean user object from sensitive data
 * @param user Prisma User object
 * @returns User object without sensitive data
 */
export const cleanUser = (user: User) => {
  const { password, ...cleanedUser } = user;
  return cleanedUser;
};

/**
 * Wrapper for cleanUser to clean many users
 * @param users Array of users
 * @returns Array of cleaned users
 */
export const cleanManyUser = (users: User[]) => {
  const res = [];
  for (const user of users) {
    res.push(cleanUser(user));
  }

  return res;
};

/**
 * Creates a filter object for querying users with optional name filtering and pagination.
 *
 * @param {object} query - The query parameters for filtering and pagination.
 * @param {string} [query.name] - A string to filter users by name using a "contains" condition.
 * @param {string | number} [query.take] - The number of users to fetch per page (pagination size).
 * @param {string | number} [query.page] - The current page number for pagination (1-based index).
 *
 * @returns {Prisma.UserFindManyArgs} - A Prisma query object with filtering (`where`), pagination (`take` and `skip`) properties.
 */
export const createUserFilter = (query: any): Prisma.UserFindManyArgs => {
  // Filter
  const where: Prisma.UserWhereInput = {};
  if (query.name) where.name = { contains: query.name };

  // Pagination
  const take = query.take ? parseInt(query.take) : 0;
  let skip = 0;

  if (take && query.page && !isNaN(query.page)) {
    const page = parseInt(query.page);
    skip = (page - 1) * take;
  }

  // Staging
  const result: Prisma.UserFindManyArgs = {};
  result.where = where;
  if (skip > 0) result.skip = skip;
  if (take > 0) result.take = take;

  return result;
};

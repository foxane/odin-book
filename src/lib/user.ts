import type { Prisma, User } from '@prisma/client';

type CleanUserOptions = { owner?: boolean; admin?: boolean };

/**
 * Clean user object before sending it to the client
 *
 * @param {User} user User object from Prisma client
 * @param {object} [options] Options to control what data to include
 * @param {boolean} [options.owner=false] Include sensitive data accessible to the owner
 * @param {boolean} [options.admin=false] Include all data for administrative purposes
 * @returns Partial<User> Cleaned user object
 */
export const cleanUser = (
  user: User,
  options: CleanUserOptions = {},
): Partial<User> => {
  const { owner = false, admin = false } = options;

  // Property to remove
  const { password, email, createdAt, ...rest } = user;
  const cleanUser: Partial<User> = rest; // Give type to rest

  // Fields for owner or admin
  if (owner || admin) {
    cleanUser.email = user.email;
  }

  // Fields for admin only
  if (admin) {
    cleanUser.createdAt = user.createdAt;
  }

  return cleanUser;
};

/**
 * Wrapper for cleanUser to clean many users
 *
 * @param {User[]} users Array of users
 * @returns Array of cleaned users
 */
export const cleanManyUser = (users: User[], options?: CleanUserOptions) => {
  const res = [];
  for (const user of users) {
    res.push(cleanUser(user, options));
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

export const normalizeCount = (user: any) => {
  const normalize = (user: any) => {
    const { _count, ...rest } = user;

    rest.followerCount = _count.follower;
    rest.followingCount = _count.following;

    return rest;
  };

  if (Array.isArray(user)) {
    const result = [];
    for (const u of user) {
      result.push(normalize(u));
    }

    return result;
  }

  return normalize(user);
};

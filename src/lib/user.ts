import type { Prisma, User } from '@prisma/client';

type CleanUserOptions = { owner?: boolean; admin?: boolean };
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

export const cleanManyUser = (users: User[], options?: CleanUserOptions) => {
  const res = [];
  for (const user of users) {
    res.push(cleanUser(user, options));
  }

  return res;
};

type UserQuery = {
  search?: string;
  take?: string;
  cursor?: string;
  online?: string;
};
export const createUserFilter = (query: UserQuery) => {
  // Filter
  const where: Prisma.UserWhereInput = {};

  if (query.search)
    where.name = { contains: query.search, mode: 'insensitive' };

  // No online query will return all users
  if (query.online === 'true') where.lastSeen = null;
  else if (query.online === 'false') where.lastSeen = { not: null };

  // Pagination
  const take = query.take ? parseInt(query.take) : 10; // Default

  // Staging
  const result: Prisma.UserFindManyArgs = {
    where,
    take,
  };

  if (query.cursor) {
    result.cursor = { id: Number(query.cursor) };

    result.skip = 1;
  }

  return result;
};

export const appendIsFollowed = (u: any) => {
  const user = { ...u };
  user.isFollowed = u.follower.length > 0;
  delete user.follower;
  return user;
};

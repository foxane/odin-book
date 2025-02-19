import type { Prisma, User } from '@prisma/client';
import { createCursor } from './utils';

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
};
export const createUserFilter = (query: UserQuery) => {
  // Filter
  const where: Prisma.UserWhereInput = {};

  if (query.search)
    where.name = { contains: query.search, mode: 'insensitive' };

  // Staging
  const result: Prisma.UserFindManyArgs = {
    where,
    ...createCursor(query.cursor, query.take),
  };

  return result;
};

export const appendIsFollowed = (u: any) => {
  const user = { ...u };
  user.isFollowed = u.follower.length > 0;
  delete user.follower;
  return user;
};

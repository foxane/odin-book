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
  name?: string;
  take?: string;
  page?: string;
};
export const createUserFilter = (query: UserQuery) => {
  // Filter
  const where: Prisma.UserWhereInput = {};
  if (query.name) where.name = { contains: query.name };

  // Pagination
  const page = query.page ? parseInt(query.page) : 0;
  const take = query.take ? parseInt(query.take) : 0;
  let skip = 0;

  // Populate skip when take and page is above 0
  if (take > 0 && page > 0) {
    skip = (page - 1) * take;
  }

  // Staging
  const result: Prisma.UserFindManyArgs = {};
  result.where = where;
  if (skip > 0) result.skip = skip;
  if (take > 0) result.take = take;

  return result;
};

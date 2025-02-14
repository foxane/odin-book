import type { Prisma } from '@prisma/client';

type CommentQuery = {
  take?: string;
  cursor?: string;
  order?: 'asc' | 'desc';
  sort?: 'date' | 'like';
};
export const createCommentFilter = (query: CommentQuery) => {
  // Order
  const orderBy: Prisma.CommentOrderByWithRelationInput = {
    ...(query.sort === 'like'
      ? { likedBy: { _count: 'desc' } }
      : { createdAt: query.order === 'asc' ? 'asc' : 'desc' }),
  };

  // Pagination
  const take = query.take ? parseInt(query.take) : 10; // Take 10 by default
  const cursor = query.cursor ? { id: parseInt(query.cursor) } : undefined;

  // Staging
  const result: Prisma.CommentFindManyArgs = {
    orderBy,
    take,
  };

  if (cursor) {
    result.cursor = cursor;
    result.skip = 1; // Skip the cursor item itself
  }

  return result;
};

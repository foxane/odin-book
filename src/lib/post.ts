import type { Prisma } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';

export const sanitizeText = (str: string) => {
  const cleanHtml = sanitizeHtml(str, { allowedTags: ['b', 'i', 'strong'] });

  // Split line => remove spaces => filter blanks => wrap in p tag
  return cleanHtml
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p>${line}</p>`)
    .join('');
};

type PostQuery = {
  search?: string;
  take?: string;
  cursor?: string;
  order?: 'asc' | 'desc';
};
export const createPostFilter = (query: PostQuery) => {
  // FIlter
  const where: Prisma.PostWhereInput = {};
  if (query.search)
    where.text = { contains: query.search, mode: 'insensitive' };

  // Pagination
  const take = query.take ? parseInt(query.take) : 10; // Take 10 by default
  const cursor = query.cursor ? { id: parseInt(query.cursor) } : undefined;

  // Staging
  const result: Prisma.PostFindManyArgs = {
    where,
    orderBy: { createdAt: query.order !== 'asc' ? 'desc' : 'asc' },
    take,
  };

  if (cursor) {
    result.cursor = cursor;
    result.skip = 1; // Skip the cursor item itself
  }

  return result;
};

// TODO: Find a way to not use any
export const appendIsLiked = (p: any) => {
  const post = { ...p };
  post.isLiked = post.likedBy.length > 0;
  delete post.likedBy;

  return post;
};

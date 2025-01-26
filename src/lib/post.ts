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
  page?: string;
  order?: 'asc' | 'desc';
};
export const createPostFilter = (query: PostQuery) => {
  // FIlter
  const where: Prisma.PostWhereInput = {};
  if (query.search) where.text = { contains: query.search };

  // Pagination
  const page = query.page ? parseInt(query.page) : 0;
  const take = query.take ? parseInt(query.take) : 0;
  let skip = 0;

  // Populate skip when take and page is above 0
  if (take > 0 && page > 0) {
    skip = (page - 1) * take;
  }

  // Staging
  const result: Prisma.PostFindManyArgs = {};
  result.where = where;
  result.orderBy = { createdAt: query.order !== 'asc' ? 'desc' : 'asc' };
  if (skip > 0) result.skip = skip;
  if (take > 0) result.take = take;

  return result;
};

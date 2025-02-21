import type { Comment, NotifType, Post } from '@prisma/client';
import { prisma } from './prismaClient';

interface Base {
  type: NotifType;
  actorId: string;
  res?: Post | Comment;
}

interface CreateMany extends Base {
  receiverId: string[];
}

interface CreateSingle extends Base {
  receiverId: string;
}

const isComment = (res: Post | Comment): res is Comment =>
  typeof res === 'object' && res !== null && 'postId' in res;

const createResProp = (res?: Post | Comment) => {
  if (!res) return {};
  return isComment(res)
    ? { commentId: res.id, postId: res.postId }
    : { postId: res.id };
};

const many = async (opts: CreateMany) => {
  const { receiverId, actorId, type, res } = opts;
  return await prisma.notification.createMany({
    data: receiverId.map(el => ({
      type,
      actorId,
      receiverId: el,
      ...createResProp(res),
    })),
  });
};

const single = async (opts: CreateSingle) => {
  const { receiverId, actorId, type, res } = opts;
  return await prisma.notification.create({
    data: {
      type,
      actorId,
      receiverId,
      ...createResProp(res),
    },
  });
};

export { many, single };

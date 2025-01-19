import { describe, test } from 'bun:test';
import request from 'supertest';
import { signJwt } from '@/lib/utils';
import app from '@/app';
import type { User } from '@prisma/client';

const user: User = {
  id: 'test',
  name: 'test',
  email: 'test@email.com',
  password: 'test',
  avatar: null,
};

describe('Post', () => {
  test.skip('should return 201 and the post created', async done => {
    const token = signJwt(user);
    await request(app)
      .post('/post')
      .send({ content: 'testerhaiya' })
      .auth(token, { type: 'bearer' })
      .expect(201)
      .expect({ content: 'testerhaiya' });

    await request(app)
      .get('/post/test')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect({ userId: 'test', content: 'testerhaiya' }, done);
  });
});

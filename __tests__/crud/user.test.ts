import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { prisma } from '@/lib/prisma';
import request from 'supertest';
import app from '@/app';
import { signJwt } from '@/lib/utils';
import type { User } from '@prisma/client';

const user1 = { id: 'bravo', name: 'bravo', password: 'test' };
const user2 = { id: 'charlie', name: 'charlie', password: 'test' };

describe('User', () => {
  beforeAll(async () => {
    await prisma.user.createMany({ data: [user1, user2] });
  });
  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  /**
   * Unauthorized access
   */
  test('should return 40X', async () => {
    await request(app).get('/user').expect(401);
    await request(app).get('/user/:bravo').expect(401);
    await request(app).put('/user/:bravo').expect(401);
  });

  /**
   * Return all list of users
   */
  test('should return list of users', async () => {
    const res = await request(app)
      .get('/user')
      .auth(signJwt(user1 as User), { type: 'bearer' });

    expect(res.body).toBeArrayOfSize(2);
    expect(res.body).toMatchObject([{ name: 'bravo' }, { name: 'charlie' }]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body[0]).not.toContainKey('password');
  });

  /**
   * Query filter test
   */
  test('should return filtered list of users', async () => {
    const res = await request(app)
      .get('/user?name=rav')
      .auth(signJwt(user1 as User), { type: 'bearer' });

    expect(res.body).toBeArrayOfSize(1);
    expect(res.body).toMatchObject([{ name: 'bravo' }]);
  });

  /**
   * Single user
   */
  test('should return single user', async () => {
    await request(app)
      .get('/user/babi')
      .auth(signJwt(user1 as User), { type: 'bearer' })
      .expect(404);

    await request(app)
      .get('/user/bravo')
      .auth(signJwt(user1 as User), { type: 'bearer' })
      .expect(200)
      .expect({ id: 'bravo', name: 'bravo', email: null, avatar: null });
  });

  /**
   * Update user
   */
  test('should update userdata on specified field, omitted are unchanged', async () => {
    await request(app)
      .put('/user/bravo')
      .send({ name: 'brav', email: 'brav@test.com', avatar: 'http://av.co/12' })
      .auth(signJwt(user1 as User), { type: 'bearer' })
      .expect(200)
      .expect({
        id: 'bravo',
        name: 'brav',
        email: 'brav@test.com',
        avatar: 'http://av.co/12',
      });

    await request(app)
      .put('/user/charlie')
      .auth(signJwt(user2 as User), { type: 'bearer' })
      .send({ name: 'charchar' })
      .expect({ id: 'charlie', name: 'charchar', email: null, avatar: null });
  });

  /**
   * Update validation
   */
  test('Should reject bad request', async () => {
    await request(app)
      .put('/user/charlie')
      .auth(signJwt(user2 as User), { type: 'bearer' })
      .send({ email: 'notemail', avatar: 'noturl' })
      .expect(400);
  });
});

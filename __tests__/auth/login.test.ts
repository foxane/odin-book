import type { User } from '@prisma/client';
import { describe, expect, test } from 'bun:test';
import request from 'supertest';
import type { AuthResponse, AuthResponseError } from '../types';
import app from '@/app';

const user: User = {
  id: 'test',
  name: 'test',
  email: 'test@email.com',
  password: 'test',
};

describe('Login', async () => {
  await request(app).post('/auth/signup').send(user);

  test('should send user data with token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: user.password });
    const data = response.body as AuthResponse;

    expect(response.statusCode).toBe(200);
    expect(data.user.email).toBe(user.email);
    expect(data.token).toBeString();
  });

  test('wrong credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'a@a.com', password: 'pw' });

    const data = response.body as AuthResponseError;
    expect(response.statusCode).toBe(401);
    expect(data.message).toBe('Invalid credentials');
  });

  test('invalid body', async () => {
    const response = await request(app).post('/auth/login').send({});
    const data = response.body as AuthResponseError;

    expect(response.statusCode).toBe(400);
    expect(data.message).toBe('Validation failed');
    expect(data.errorDetails).toBeArray();
  });
});

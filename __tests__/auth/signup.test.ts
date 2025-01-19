import { test, expect, describe, afterAll } from 'bun:test';
import request from 'supertest';
import app from '@/app';
import type { User } from '@prisma/client';
import type { AuthResponse, AuthResponseError } from '@/@types/test';
import { prisma } from '@/lib/prisma';

const user: User = {
  id: 'test',
  name: 'test',
  email: `${Math.floor(Math.random()).toString()}test@email.com`,
  password: 'test',
  avatar: null,
};

describe('Signup', () => {
  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  test('should send user data and token', async () => {
    const response = await request(app).post('/auth/signup').send(user);
    const data = response.body as AuthResponse;

    expect(response.statusCode).toBe(201);
    expect(data.user.email).toBe(user.email);
    expect(data.token).toBeString();
  });

  test('used email', async () => {
    const response = await request(app).post('/auth/signup').send(user);
    const data = response.body as AuthResponseError;

    expect(response.statusCode).toBe(400);
    expect(data.errorDetails).toContain('Email already in use');
  });
});

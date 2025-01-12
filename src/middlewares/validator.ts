import { prisma } from '@/lib/prisma';
import type { RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';

const validate: RequestHandler = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map(err => err.msg as string);

    res.status(400).json({
      message: 'Validation failed',
      errorDetails: errors,
    });
    return;
  }

  next();
};

export const signupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 3, max: 20 })
    .withMessage('Name can only between 3 and 20 characters'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail({ all_lowercase: true })
    .custom(async (value: string) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: value },
      });
      if (existingUser) {
        throw new Error('Email already in use');
      }
      return true;
    }),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 2 })
    .withMessage('Password too short, need to be at least 2 characters'),

  validate,
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail({ all_lowercase: true }),

  body('password').trim().notEmpty().withMessage('Empty password'),

  validate,
];

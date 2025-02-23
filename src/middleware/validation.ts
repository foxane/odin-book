import { prisma } from '@/lib/prismaClient';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
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

export const signup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isAlphanumeric('en-US', { ignore: ' ' })
    .withMessage('Name can only be alphanumeric')
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
    .isLength({ min: 2, max: 20 })
    .withMessage('Password too short, need to be between 2 and 20 characters'),

  validate,
];

export const login = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail({ all_lowercase: true }),

  body('password').trim().notEmpty().withMessage('Empty password'),

  validate,
];

export const userUpdate = [
  /**
   * Check if at least on field is provided
   */
  (req: Request, res: Response, next: NextFunction) => {
    const formFields = ['name', 'email', 'password'];

    const hasValidField =
      req.body &&
      formFields.some(
        field =>
          req.body[field] !== undefined &&
          req.body[field] !== null &&
          req.body[field].trim() !== '',
      );

    if (!hasValidField) {
      res.status(400).json({
        message: 'No payload, why the fuck are you sending it?',
      });
      return;
    }

    next();
  },

  body('name')
    .optional()
    .trim()
    .isAlphanumeric('en-US', { ignore: ' ' })
    .withMessage('Name can only be alphanumeric')
    .isLength({ min: 3, max: 20 })
    .withMessage('Name can only between 3 and 20 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail({ all_lowercase: true })
    .custom(async (value: string, { req }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: value },
      });

      /**
       * Check if the email is already connected to a different user.
       * If yes, throw an error. If no, allow the update.
       */
      if (existingUser && existingUser.id !== req['user'].id) {
        throw new Error('Email already in use');
      }

      return true;
    }),

  body('password')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Name can only between 3 and 20 characters'),

  validate,
];

export const newPost = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Text field cannot be empty')
    .isLength({ min: 3, max: 300 })
    .withMessage('Text field can only between 3 and 300 characters'),

  validate,
];

import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  console.error(err);

  /**
   * Prisma related errors
   */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A unique constraint was violated.';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'The requested resource was not found.';
        break;
      default:
        message = 'A database error occurred.';
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = 'An unknown database error occurred.';
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data sent to the database.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
};

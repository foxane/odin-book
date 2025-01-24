import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { errorLogger } from './logger';

export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
  let statusCode = 500;
  let message = 'Internal server error';

  /**
   * Log the error
   */
  errorLogger.error(`${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    originalError: err,
  });

  /**
   * Prisma related error
   */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        statusCode = 409;
        message =
          'A unique constraint was violated. This resource may already exist.';
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = 'The requested resource was not found.';
        break;
      case 'P2003': // Foreign key constraint failure
        statusCode = 400;
        message = 'Operation failed due to a related record constraint.';
        break;
      default:
        message = 'A database error occurred.';
    }
  }
  // Prisma unknown request error
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = 'An unexpected database error occurred.';
  }
  // Prisma validation error
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data format sent to the database.';
  } else if (err.name === 'BcryptError') {
    /**
     * Bcrypt related error
     */
    statusCode = 400;
    switch (err.message) {
      case 'Hash not generated':
        message = 'Password could not be securely hashed.';
        break;
      case 'Invalid hash':
        message = 'The provided password hash is invalid.';
        break;
      case 'Comparison failed':
        message = 'Password verification failed.';
        break;
      default:
        message = 'Authentication-related error occurred.';
    }
  } else {
    /**
     * Generic error
     */
    // Attempt to capture any unexpected error details
    message = err.message || 'An unexpected error occurred';
    statusCode = err.status || 500;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
      }),
    },
  });
};

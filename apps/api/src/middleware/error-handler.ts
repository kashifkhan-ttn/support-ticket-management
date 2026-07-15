import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, formatZodErrors, isPrismaNotFound } from '../lib/errors.js';
import { StatusTransitionError } from '../state-machine/ticket-status.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors ?? [{ field: 'general', message: err.message }],
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: formatZodErrors(err),
    });
  }

  if (err instanceof StatusTransitionError) {
    return res.status(422).json({
      message: err.message,
      errors: [{ field: 'status', message: err.message }],
    });
  }

  if (isPrismaNotFound(err)) {
    return res.status(404).json({
      message: 'Resource not found',
      errors: [{ field: 'id', message: 'Resource not found' }],
    });
  }

  console.error(err);
  return res.status(500).json({
    message: 'Internal server error',
    errors: [{ field: 'general', message: 'An unexpected error occurred' }],
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

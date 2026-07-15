import { Prisma } from '@prisma/client';
import { ZodError, ZodIssue } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function formatZodErrors(error: ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue: ZodIssue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}

export function isPrismaNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
  );
}

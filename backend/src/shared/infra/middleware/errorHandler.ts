import type { Request, Response, NextFunction } from 'express';
import { env } from '@config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[Error]', err);

  // Zod validation errors
  if (err.name === 'ZodError') {
    const zodErr = err as { issues?: Array<{ message: string; path: (string | number)[] }> };
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: zodErr.issues?.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // Known application errors
  if (err.message === 'Email already registered') {
    res.status(409).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err.message === 'Invalid credentials') {
    res.status(401).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err.message === 'User not found') {
    res.status(404).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Default: internal server error
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

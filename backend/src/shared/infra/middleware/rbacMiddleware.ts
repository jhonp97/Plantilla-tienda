import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@shared/infra/middleware/authMiddleware';

type Role = 'ADMIN' | 'CUSTOMER';

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: No user found',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions',
      });
      return;
    }

    next();
  };
}

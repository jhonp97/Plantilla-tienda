import { Router } from 'express';
import { CouponController } from '@modules/coupon/infrastructure/coupon.controller';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';
import { couponValidateRateLimiter } from '@shared/infra/middleware/rateLimiter';

export function createCouponRouter(controller: CouponController): Router {
  const router = Router();

  // Admin CRUD routes
  router.get('/', authMiddleware, requireRole('ADMIN'), controller.list);
  router.post('/', authMiddleware, requireRole('ADMIN'), controller.create);
  router.put('/:id', authMiddleware, requireRole('ADMIN'), controller.update);
  router.delete('/:id', authMiddleware, requireRole('ADMIN'), controller.delete);

  return router;
}

export function createCouponValidateRouter(controller: CouponController): Router {
  const router = Router();

  // Public validation route (rate-limited)
  router.get('/validate', couponValidateRateLimiter, controller.validate);

  return router;
}

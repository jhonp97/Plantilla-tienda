import { Router } from 'express';
import { ShippingController } from '@modules/order/infrastructure/http/ShippingController';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';

export function createShippingRouter(controller: ShippingController): Router {
  const router = Router();

  // Public - calculate shipping cost
  router.post('/calculate', controller.calculate);
  router.get('/config', controller.getConfig);

  // Admin only - update shipping config
  router.put('/config', authMiddleware, requireRole('ADMIN'), controller.updateConfig);

  return router;
}
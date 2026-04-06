import { Router } from 'express';
import { AnalyticsController } from '@modules/order/infrastructure/http/AnalyticsController';
import { authMiddleware } from '@shared/infra/middleware/authMiddleware';
import { requireRole } from '@shared/infra/middleware/rbacMiddleware';

export function createAnalyticsRouter(controller: AnalyticsController): Router {
  const router = Router();

  // All analytics routes require admin role
  router.get('/dashboard', authMiddleware, requireRole('ADMIN'), controller.getDashboard);
  router.get('/sales', authMiddleware, requireRole('ADMIN'), controller.getSales);
  router.get('/products', authMiddleware, requireRole('ADMIN'), controller.getProductPerformance);
  router.get('/customers', authMiddleware, requireRole('ADMIN'), controller.getTopCustomers);
  router.get('/low-stock', authMiddleware, requireRole('ADMIN'), controller.getLowStock);

  return router;
}